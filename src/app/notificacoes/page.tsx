'use client';
import Link from 'next/link';
import { ArrowLeft, Bell, Package, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { collection, query, where, orderBy, getDocs, or } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface BaseOrder extends WithId<any> {
  id: string;
  orderDate: string; // Unified date field
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

  useEffect(() => {
    if (isUserLoading || !user || !firestore) {
      if (!isUserLoading) setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const storesRef = collection(firestore, 'stores');
        const storeQuery = query(storesRef, where('userId', '==', user.uid));
        const storeSnapshot = await getDocs(storeQuery);
        const ownedStoreIds = storeSnapshot.docs.map(doc => doc.id);
        
        let notificationsQuery;
        const ordersRef = collection(firestore, 'orders');

        // Build a query that gets all notifications for the user, whether they are a buyer or a seller.
        const userIsBuyer = where('customerId', '==', user.uid);
        const userIsSeller = ownedStoreIds.length > 0 ? where('storeId', 'in', ownedStoreIds) : null;

        const buyerHasUnread = where('buyerHasUnread', '==', true);
        const sellerHasUnread = where('sellerHasUnread', '==', true);
        
        // Conditions for fetching notifications
        const buyerNotifications = and(userIsBuyer, buyerHasUnread);
        const sellerNotifications = userIsSeller ? and(userIsSeller, sellerHasUnread) : null;
        
        let finalConditions = [buyerNotifications];
        if (sellerNotifications) {
            finalConditions.push(sellerNotifications);
        }

        notificationsQuery = query(ordersRef, or(...finalConditions), orderBy('orderDate', 'desc'));

        const querySnapshot = await getDocs(notificationsQuery);
        const allNotifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));

        setNotifications(allNotifications);

      } catch (error) {
        // FirebaseError: The query requires an index. You can create it here:
        // This is a common error. The console provides a direct link to create it.
        if (error instanceof Error && error.message.includes('The query requires an index')) {
            console.warn("Firestore index missing for notifications query. Please create it using the link in the Firebase console error message.");
            // We can show a friendly message to the user in this case.
            toast.error("A configuração do banco de dados está sendo finalizada. Tente novamente em alguns minutos.");
        } else {
            console.error("Failed to fetch notifications:", error);
            toast.error("Erro ao buscar notificações.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Helper functions for query composition. `and` is imported from 'firebase/firestore'
    const { and } = require("firebase/firestore");
    fetchNotifications();
  }, [user, firestore, isUserLoading]);


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

  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl">
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
                        const date = notification.orderDate;

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
                                    {date ? formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR }) : ''}
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
    </div>
  );
}
