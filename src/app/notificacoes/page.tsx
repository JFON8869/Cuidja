'use client';
import Link from 'next/link';
import { ArrowLeft, Bell, Package, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, getDocs, or } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { errorEmitter, FirestorePermissionError } from '@/firebase';
import BottomNav from '@/components/layout/BottomNav';

interface BaseOrder extends WithId<any> {
  id: string;
  orderDate: any; 
  status: string;
  sellerHasUnread?: boolean;
  buyerHasUnread?: boolean;
  storeId: string;
  customerId: string;
  sellerId: string;
}

interface PurchaseOrder extends BaseOrder {
    orderType: 'PURCHASE';
    totalAmount: number;
    items: { name: string }[];
}

interface ServiceRequest extends BaseOrder {
    orderType: 'SERVICE_REQUEST';
    serviceName: string;
}

type Notification = PurchaseOrder | ServiceRequest;

export default function NotificationsPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user || !firestore) {
      if (!isUserLoading) setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
        const ordersRef = collection(firestore, 'orders');
        
        // Fetch notifications where the user is the customer
        const asCustomerQuery = query(
            ordersRef,
            where('customerId', '==', user.uid),
            where('buyerHasUnread', '==', true)
        );
        
        // Fetch notifications where the user is the seller
        const asSellerQuery = query(
            ordersRef,
            where('sellerId', '==', user.uid),
            where('sellerHasUnread', '==', true)
        );

        const [customerResults, sellerResults] = await Promise.all([
            getDocs(asCustomerQuery),
            getDocs(asSellerQuery)
        ]);

        const customerNotifications = customerResults.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        const sellerNotifications = sellerResults.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        
        // Combine, remove potential duplicates, and sort
        const allNotificationsMap = new Map<string, Notification>();
        [...customerNotifications, ...sellerNotifications].forEach(n => {
            allNotificationsMap.set(n.id, n);
        });

        const allNotifications = Array.from(allNotificationsMap.values());
        
        allNotifications.sort((a, b) => {
            const dateA = a.orderDate?.toDate ? a.orderDate.toDate() : new Date(a.orderDate || 0);
            const dateB = b.orderDate?.toDate ? b.orderDate.toDate() : new Date(b.orderDate || 0);
            return dateB.getTime() - dateA.getTime();
        });
        
        setNotifications(allNotifications);

    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      
      const permissionError = new FirestorePermissionError({
        path: `orders where customerId or sellerId is ${user.uid}`,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);

      if (error instanceof Error && error.message.includes('The query requires an index')) {
          toast.error("A configuração do banco de dados está sendo finalizada. Tente novamente em alguns minutos.");
      } else {
          toast.error("Erro ao buscar notificações.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, firestore, isUserLoading]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);


  const renderSkeleton = () => (
    <div className="p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border-b">
                <Skeleton className="h-10 w-10 rounded-full mt-1" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            </div>
        ))}
    </div>
  );

  const getNotificationText = (notification: Notification) => {
    const isSellerNotification = notification.sellerId === user?.uid;
    
    if (isSellerNotification) {
      if (notification.orderType === 'SERVICE_REQUEST') {
        return <>Nova solicitação para o serviço <span className="font-bold">{notification.serviceName}</span>.</>;
      }
      return <>Você recebeu um novo pedido! <span className="font-bold">#{(notification.id || '').substring(0,7)}</span>.</>;
    } else {
      return <>O status do seu {notification.orderType === 'SERVICE_REQUEST' ? 'serviço' : 'pedido'} <span className="font-bold">#{(notification.id || '').substring(0,7)}</span> foi atualizado para <span className="font-semibold text-accent">{notification.status}</span>.</>;
    }
  };

  const getFormattedDate = (orderDate: any) => {
    if (!orderDate) return '';
    // Handle both Firestore Timestamp and string date formats
    const date = orderDate?.toDate ? orderDate.toDate() : new Date(orderDate);
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };


  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] pb-16 shadow-2xl">
      <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto">Notificações</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {isLoading ? renderSkeleton() : (
            notifications && notifications.length > 0 ? (
                <div className="divide-y">
                    {notifications.map(notification => {
                        const href = `/pedidos/${notification.id}`;
                        const date = getFormattedDate(notification.orderDate);

                        return (
                        <Link href={href} key={notification.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                {notification.orderType === 'SERVICE_REQUEST' ? <Wrench className="h-5 w-5 text-primary" /> : <Package className="h-5 w-5 text-primary" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">
                                  {getNotificationText(notification)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {date}
                                </p>
                            </div>
                        </Link>
                        )
                    })}
                </div>
            ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-4 h-[80vh]">
                    <Bell className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Nenhuma notificação nova</h2>
                    <p className="text-muted-foreground">
                    Quando houver atualizações, elas aparecerão aqui.
                    </p>
                </div>
            )
        )}
      </main>
      <BottomNav />
    </div>
  );
}
