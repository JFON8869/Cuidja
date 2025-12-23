'use client';
import Link from 'next/link';
import { ArrowLeft, Bell, Package, Wrench, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'react-hot-toast';

interface Order extends WithId<any> {
  id: string;
  orderDate: string;
  requestDate?: string;
  status: string;
  totalAmount: number;
  sellerHasUnread?: boolean;
  buyerHasUnread?: boolean;
  storeId: string;
  customerId: string;
  items?: { name: string }[];
  serviceName?: string;
}

type Notification = Order & {type: 'order' | 'service'};

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
        const storeIds = storeSnapshot.docs.map(doc => doc.id);
        
        const allNotifications: Notification[] = [];

        // Buyer notifications
        const buyerOrdersQuery = query(collection(firestore, 'orders'), where('customerId', '==', user.uid), where('buyerHasUnread', '==', true));
        const buyerServicesQuery = query(collection(firestore, 'serviceRequests'), where('customerId', '==', user.uid), where('buyerHasUnread', '==', true));

        const [buyerOrdersSnapshot, buyerServicesSnapshot] = await Promise.all([
            getDocs(buyerOrdersQuery),
            getDocs(buyerServicesQuery),
        ]);

        buyerOrdersSnapshot.forEach(doc => {
          allNotifications.push({ ...(doc.data() as Order), id: doc.id, type: 'order' });
        });
        buyerServicesSnapshot.forEach(doc => {
            allNotifications.push({ ...(doc.data() as Order), id: doc.id, type: 'service' });
        });

        // Seller notifications (only if they own stores)
        if (storeIds.length > 0) {
            const sellerOrdersQuery = query(collection(firestore, 'orders'), where('storeId', 'in', storeIds), where('sellerHasUnread', '==', true));
            const sellerServicesQuery = query(collection(firestore, 'serviceRequests'), where('storeId', 'in', storeIds), where('sellerHasUnread', '==', true));
            
            const [sellerOrdersSnapshot, sellerServicesSnapshot] = await Promise.all([
                getDocs(sellerOrdersQuery),
                getDocs(sellerServicesQuery),
            ]);

            sellerOrdersSnapshot.forEach(doc => {
                allNotifications.push({ ...(doc.data() as Order), id: doc.id, type: 'order' });
            });
            sellerServicesSnapshot.forEach(doc => {
                allNotifications.push({ ...(doc.data() as Order), id: doc.id, type: 'service' });
            });
        }
        
        // Remove duplicates and sort
        const uniqueNotifications = Array.from(new Map(allNotifications.map(n => [n.id, n])).values());
        uniqueNotifications.sort((a, b) => {
            const dateA = new Date(a.orderDate || a.requestDate || 0);
            const dateB = new Date(b.orderDate || b.requestDate || 0);
            return dateB.getTime() - dateA.getTime();
        });

        setNotifications(uniqueNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Erro ao buscar notificações.");
      } finally {
        setIsLoading(false);
      }
    };

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
                        const href = `/pedidos/${notification.id}?type=${notification.type}`;
                        const isSellerNotification = notification.customerId !== user?.uid;
                        const date = notification.orderDate || notification.requestDate;

                        return (
                        <Link href={href} key={notification.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                {notification.type === 'service' ? <Wrench className="h-5 w-5 text-primary" /> : <Package className="h-5 w-5 text-primary" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    {isSellerNotification ? (
                                        notification.type === 'service' ? (
                                            <>
                                                Nova solicitação para o serviço <span className="font-bold">{notification.serviceName}</span>.
                                            </>
                                        ) : (
                                            <>
                                                Você recebeu um novo pedido! <span className="font-bold">#{notification.id.substring(0,7)}</span>.
                                            </>
                                        )
                                    ) : (
                                        <>
                                            O status do seu {notification.type === 'service' ? 'serviço' : 'pedido'} <span className="font-bold">#{notification.id.substring(0,7)}</span> foi atualizado para <span className="font-semibold text-accent">{notification.status}</span>.
                                        </>
                                    )}
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
                    Quando houver atualizações sobre seus pedidos ou vendas, elas aparecerão aqui.
                    </p>
                </div>
            )
        )}
      </main>
    </div>
  );
}
