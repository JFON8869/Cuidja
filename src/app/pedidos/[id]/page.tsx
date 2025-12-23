
'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, User as UserIcon, Phone, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { doc, updateDoc, getDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, writeBatch } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc, WithId } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import StatusUpdater from '@/components/vender/StatusUpdater';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  } | Date;
}

interface Address {
    name: string;
    street: string;
    city: string;
    zip: string;
    number: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderDate: string;
  items: OrderItem[];
  status: string;
  totalAmount: number;
  customerId: string; 
  storeId: string;
  messages?: any[]; // Legacy field for migration
  sellerHasUnread?: boolean;
  buyerHasUnread?: boolean;
  shippingAddress?: Address;
  phone?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { firestore, user, isUserLoading } = useFirebase();
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  const orderRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'orders', id as string);
  }, [firestore, id]);

  const { data: order, isLoading: isOrderLoading, error: orderError } = useDoc<WithId<Order>>(orderRef);
  
  const messagesQuery = useMemoFirebase(() => {
    if (!orderRef) return null;
    return query(collection(orderRef, 'messages'), orderBy('timestamp', 'asc'), limit(50));
  }, [orderRef]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
  
  // --- Migration Logic ---
  useEffect(() => {
    const migrateLegacyMessages = async () => {
        if (!firestore || !orderRef || !order || !order.messages || order.messages.length === 0) {
            return;
        }

        toast.loading('Atualizando estrutura do chat...');
        
        try {
            const batch = writeBatch(firestore);
            const messagesColRef = collection(orderRef, 'messages');

            order.messages.forEach((msg: any) => {
                const newMsgRef = doc(messagesColRef);
                batch.set(newMsgRef, {
                    ...msg,
                    timestamp: new Date(msg.timestamp) // Convert ISO string to Firebase Timestamp
                });
            });

            // After adding all messages to the new subcollection, remove the old array
            batch.update(orderRef, { messages: [] }); // Or delete(field) if you prefer
            
            await batch.commit();
            toast.dismiss();
            toast.success('Chat atualizado com sucesso!');
        } catch (err) {
            toast.dismiss();
            toast.error('Não foi possível atualizar a estrutura do chat.');
            console.error("Error migrating messages:", err);
        }
    };

    if (order) {
        migrateLegacyMessages();
    }
  }, [order, orderRef, firestore]);
  

  // --- User & Role Logic ---
  useEffect(() => {
    const checkSeller = async () => {
        if (user && firestore && order?.storeId) {
            const storeRef = doc(firestore, 'stores', order.storeId);
            const storeSnap = await getDoc(storeRef);
            if (storeSnap.exists() && storeSnap.data().userId === user.uid) {
                setIsSeller(true);
            } else {
                setIsSeller(false);
            }
        } else {
            setIsSeller(false);
        }
    };
    if (!isUserLoading && user && order) {
        checkSeller();
    }
  }, [user, firestore, order, isUserLoading]);

  // --- Effects for UI ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      scrollToBottom();
  }, [messages]);

  // Mark order as read when viewing
  useEffect(() => {
    if (!orderRef || !order || !user || isSeller === undefined) return;
    
    const isBuyer = user.uid === order.customerId;
    let payload = {};

    if (isBuyer && order.buyerHasUnread) {
        payload = { buyerHasUnread: false };
    } else if (isSeller && order.sellerHasUnread) {
        payload = { sellerHasUnread: false };
    }

    if (Object.keys(payload).length > 0) {
        updateDoc(orderRef, payload).catch(err => console.error("Failed to mark order as read:", err));
    }
  }, [order, user, orderRef, isSeller]);
  
  // --- Event Handlers ---
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !orderRef || !newMessage.trim()) return;
    
    setIsSubmitting(true);

    const messagesColRef = collection(orderRef, 'messages');
    
    const messagePayload = {
      senderId: user.uid,
      text: newMessage.trim(),
      timestamp: serverTimestamp(),
    };
    
    const isBuyer = user.uid === order?.customerId;
    const updatePayload = {
      lastMessageTimestamp: serverTimestamp(),
      ...(isBuyer 
         ? { sellerHasUnread: true }
         : { buyerHasUnread: true }
      ),
    };

    try {
      await addDoc(messagesColRef, messagePayload);
      await updateDoc(orderRef, updatePayload);
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message: ", err);
      
      const permissionError = new FirestorePermissionError({
        path: messagesColRef.path,
        operation: 'create',
        requestResourceData: messagePayload,
      });

      errorEmitter.emit('permission-error', permissionError);

      toast.error('Erro ao enviar mensagem. Verifique suas permissões e tente novamente.');
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  const isLoading = isOrderLoading || isUserLoading;

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (orderError || !order) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold">Pedido não encontrado</h2>
        <p className="text-muted-foreground">O pedido que você está procurando não existe ou você não tem permissão para vê-lo.</p>
        <Button asChild variant="link">
          <Link href="/pedidos">Voltar para Meus Pedidos</Link>
        </Button>
      </div>
    );
  }
  
  const isBuyer = user?.uid === order.customerId;
  
  if (!isUserLoading && !isBuyer && !isSeller) {
     router.push('/login');
     return null;
  }
  
  // Convert Firestore Timestamp or Date object to a consistent Date object for formatting
  const formatTimestamp = (ts: Message['timestamp']): Date => {
      if (ts instanceof Date) {
          return ts;
      }
      if (ts && typeof ts.seconds === 'number' && typeof ts.nanoseconds === 'number') {
          return new Date(ts.seconds * 1000 + ts.nanoseconds / 1000000);
      }
      return new Date(); // Fallback
  }

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={isBuyer ? "/pedidos" : "/vender/pedidos"}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          Pedido #{order.id.substring(0, 7)}
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {isSeller ? (
            <StatusUpdater order={order} orderRef={orderRef} />
        ) : (
            <Card>
            <CardHeader>
                <CardTitle>Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p><strong>Data:</strong> {format(new Date(order.orderDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                <p><strong>Status:</strong> <span className="font-semibold text-accent">{order.status}</span></p>
                <p><strong>Itens:</strong> {order.items?.length || 'N/A'}</p>
                <p><strong>Total:</strong> 
                    <span className="font-bold">
                        {' '}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}
                    </span>
                </p>
            </CardContent>
            </Card>
        )}
        
        {isSeller && order.shippingAddress && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Informações de Entrega
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                   <p className="flex items-center gap-2">
                     <UserIcon className="h-4 w-4 text-muted-foreground" />
                     <strong>{order.shippingAddress.name}</strong>
                    </p>
                    {order.phone && (
                        <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {order.phone}
                        </p>
                    )}
                    <p className="pt-2">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Mensagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 h-64 overflow-y-auto pr-2">
                {areMessagesLoading && <Loader2 className="animate-spin mx-auto"/>}
                {!areMessagesLoading && messages && messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem ainda. Envie a primeira!</p>
                ) : (
                    messages && messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                           {msg.senderId !== user?.uid && (
                             <Avatar className="h-8 w-8">
                                <AvatarFallback>{isBuyer ? 'V' : 'C'}</AvatarFallback>
                             </Avatar>
                           )}
                           <div className={cn(
                                "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                                msg.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                                <p>{msg.text}</p>
                                <p className={cn("text-xs mt-1 text-right", msg.senderId === user?.uid ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                    {format(formatTimestamp(msg.timestamp), "HH:mm")}
                                </p>
                           </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </CardContent>
        </Card>
      </main>
      
      <footer className="border-t bg-card p-2">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..." 
                className="flex-1"
                disabled={isSubmitting}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5"/>}
            </Button>
        </form>
      </footer>
    </div>
  );
}

const OrderDetailSkeleton = () => (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-32 mx-auto" />
        <div className="w-10"></div>
      </header>
       <main className="flex-1 overflow-y-auto p-4 space-y-4">
         <Skeleton className="h-40 w-full" />
         <Skeleton className="h-64 w-full" />
       </main>
      <footer className="border-t bg-card p-2">
        <Skeleton className="h-10 w-full" />
      </footer>
    </div>
);
