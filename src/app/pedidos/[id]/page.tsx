
'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, User as UserIcon, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc, WithId } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface Address {
    name: string;
    address: string;
    city: string;
    zip: string;
}

interface Order {
  id: string;
  orderDate: string;
  productIds: string[];
  status: string;
  totalAmount: number;
  customerId: string; 
  storeId: string;
  messages?: Message[];
  sellerHasUnreadMessages?: boolean;
  buyerHasUnreadMessages?: boolean;
  shippingAddress?: Address;
  phone?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const orderRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'orders', id as string);
  }, [firestore, id]);

  const { data: order, isLoading, error } = useDoc<Order>(orderRef);
  
  const isChatEnabled = order?.messages !== undefined;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatEnabled) {
        scrollToBottom();
    }
  }, [order?.messages, isChatEnabled]);

  useEffect(() => {
    if (!order || !user || !orderRef || !isChatEnabled) return;

    const isBuyer = user.uid === order.customerId;
    const hasUnread = isBuyer
      ? order.buyerHasUnreadMessages
      : order.sellerHasUnreadMessages;
    
    if (hasUnread) {
        const payload = isBuyer ? { buyerHasUnreadMessages: false } : { sellerHasUnreadMessages: false }
        updateDoc(orderRef, payload);
    }
  }, [order, user, orderRef, isChatEnabled]);
  
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !orderRef || !newMessage.trim() || !isChatEnabled) return;
    
    setIsSubmitting(true);

    const message: Message = {
      senderId: user.uid,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const isBuyer = user.uid === order?.customerId;
    const updatePayload = {
      messages: arrayUnion(message),
      lastMessageTimestamp: new Date().toISOString(),
      ...(isBuyer 
         ? { sellerHasUnreadMessages: true }
         : { buyerHasUnreadMessages: true }
      ),
    };

    try {
      await updateDoc(orderRef, updatePayload);
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message: ", err);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar sua mensagem. Tente novamente.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };


  if (isLoading || isUserLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
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
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const checkSeller = async () => {
        if (user && firestore && order.storeId) {
            const storeRef = doc(firestore, 'stores', order.storeId);
            const storeSnap = await getDoc(storeRef);
            if (storeSnap.exists() && storeSnap.data().userId === user.uid) {
                setIsSeller(true);
            }
        }
    };
    if (!isUserLoading) {
        checkSeller();
    }
  }, [user, firestore, order.storeId, isUserLoading]);


  if (!isUserLoading && !isBuyer && !isSeller) {
     router.push('/login');
     return null;
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
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
             <p><strong>Data:</strong> {format(new Date(order.orderDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            <p><strong>Status:</strong> <span className="font-semibold text-accent">{order.status}</span></p>
            <p><strong>Itens:</strong> {order.productIds?.length || 'Serviço'}</p>
            <p><strong>Total:</strong> 
                <span className="font-bold">
                    {' '}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}
                </span>
            </p>
          </CardContent>
        </Card>
        
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
                    <p className="pt-2">{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                </CardContent>
            </Card>
        )}

        {isChatEnabled && (
        <Card>
            <CardHeader>
                <CardTitle>Mensagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 h-64 overflow-y-auto pr-2">
                {order.messages && order.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem ainda. Envie a primeira!</p>
                ) : (
                    order.messages && order.messages.map((msg, index) => (
                        <div key={index} className={cn("flex items-end gap-2", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
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
                                <p className={cn("text-xs mt-1", msg.senderId === user?.uid ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                    {format(new Date(msg.timestamp), "HH:mm")}
                                </p>
                           </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </CardContent>
        </Card>
        )}
      </main>
      
      {isChatEnabled && (
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
                <Send className="h-5 w-5"/>
            </Button>
        </form>
      </footer>
      )}
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
)

    