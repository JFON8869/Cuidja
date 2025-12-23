
'use client';

import { FormEvent, useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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

// This can represent both an Order and a ServiceRequest for simplicity in the component state
interface GenericRequest {
  id: string;
  date: string; // Combined field for orderDate or requestDate
  items: OrderItem[];
  status: string;
  totalAmount?: number; // Optional for services
  customerId: string; 
  storeId: string;
  messages?: any[]; // Legacy field
  sellerHasUnread?: boolean;
  buyerHasUnread?: boolean;
  shippingAddress?: Address;
  phone?: string;
  type: 'order' | 'service'; // To distinguish the type
}

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id } = params;
  
  const type = searchParams.get('type') === 'service' ? 'service' : 'order';
  const collectionName = type === 'service' ? 'serviceRequests' : 'orders';

  const { firestore, user, isUserLoading } = useFirebase();
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  const requestRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, collectionName, id as string);
  }, [firestore, id, collectionName]);

  const { data: requestData, isLoading: isRequestLoading, error: requestError } = useDoc<any>(requestRef);
  
  const messagesQuery = useMemoFirebase(() => {
    if (!requestRef) return null;
    return query(collection(requestRef, 'messages'), orderBy('timestamp', 'asc'), limit(50));
  }, [requestRef]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
  
  const request = useMemo((): GenericRequest | null => {
    if (!requestData) return null;
    if (type === 'service') {
        return {
            ...requestData,
            id: requestData.id,
            date: requestData.requestDate,
            items: [{ id: requestData.serviceId, name: requestData.serviceName, price: 0, quantity: 1 }],
            type: 'service'
        };
    }
    return {
        ...requestData,
        id: requestData.id,
        date: requestData.orderDate,
        type: 'order'
    };
  }, [requestData, type]);
  

  // --- User & Role Logic ---
  useEffect(() => {
    const checkSeller = async () => {
        if (user && firestore && request?.storeId) {
            const storeRef = doc(firestore, 'stores', request.storeId);
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
    if (!isUserLoading && user && request) {
        checkSeller();
    }
  }, [user, firestore, request, isUserLoading]);

  // --- Effects for UI ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      scrollToBottom();
  }, [messages]);

  // Mark request as read when viewing
  useEffect(() => {
    if (!requestRef || !request || !user || isSeller === undefined) return;
    
    const isBuyer = user.uid === request.customerId;
    let payload = {};

    if (isBuyer && request.buyerHasUnread) {
        payload = { buyerHasUnread: false };
    } else if (isSeller && request.sellerHasUnread) {
        payload = { sellerHasUnread: false };
    }

    if (Object.keys(payload).length > 0) {
        updateDoc(requestRef, payload).catch(err => console.error("Failed to mark as read:", err));
    }
  }, [request, user, requestRef, isSeller]);
  
  // --- Event Handlers ---
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !requestRef || !newMessage.trim()) return;
    
    setIsSubmitting(true);

    const messagesColRef = collection(requestRef, 'messages');
    
    const messagePayload = {
      senderId: user.uid,
      text: newMessage.trim(),
      timestamp: serverTimestamp(),
    };
    
    const isBuyer = user.uid === request?.customerId;
    const updatePayload = {
      lastMessageTimestamp: serverTimestamp(),
      ...(isBuyer 
         ? { sellerHasUnread: true }
         : { buyerHasUnread: true }
      ),
    };

    try {
      await addDoc(messagesColRef, messagePayload);
      await updateDoc(requestRef, updatePayload);
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
  const isLoading = isRequestLoading || isUserLoading;

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (requestError || !request) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold">Solicitação não encontrada</h2>
        <p className="text-muted-foreground">O item que você está procurando não existe ou você não tem permissão para vê-lo.</p>
        <Button asChild variant="link">
          <Link href="/pedidos">Voltar para Meus Pedidos</Link>
        </Button>
      </div>
    );
  }
  
  const isBuyer = user?.uid === request.customerId;
  
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
          {type === 'order' ? 'Pedido' : 'Solicitação'} #{request.id.substring(0, 7)}
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {isSeller ? (
            <StatusUpdater request={request} requestRef={requestRef} type={type} />
        ) : (
            <Card>
            <CardHeader>
                <CardTitle>Detalhes da {type === 'order' ? 'Compra' : 'Solicitação'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p><strong>Data:</strong> {format(new Date(request.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                <p><strong>Status:</strong> <span className="font-semibold text-accent">{request.status}</span></p>
                <p><strong>Item:</strong> {request.items[0]?.name || 'N/A'}</p>
                {request.type === 'order' && request.totalAmount && (
                    <p><strong>Total:</strong> 
                        <span className="font-bold">
                            {' '}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(request.totalAmount)}
                        </span>
                    </p>
                )}
            </CardContent>
            </Card>
        )}
        
        {isSeller && request.shippingAddress && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Informações do Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                   <p className="flex items-center gap-2">
                     <UserIcon className="h-4 w-4 text-muted-foreground" />
                     <strong>{request.shippingAddress.name}</strong>
                    </p>
                    {request.phone && (
                        <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {request.phone}
                        </p>
                    )}
                    <p className="pt-2">{request.shippingAddress.street}, {request.shippingAddress.city}, {request.shippingAddress.zip}</p>
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
