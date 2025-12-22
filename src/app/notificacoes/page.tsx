'use client';
import Link from 'next/link';
import { ArrowLeft, Bell, Package, Wrench, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState, useMemo } from 'react';
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
  status: string;
  totalAmount: number;
  sellerHasUnread?: boolean;
  buyerHasUnread?: boolean;
  storeId: string;
  customerId: string;
}

interface ServiceRequest extends WithId<any> {
    id: string;
    requestDate: string;
    serviceName: string;
    status: string;
    providerId: string;
    providerHasUnread?: boolean;
}

type Notification = (Order | ServiceRequest) & {type: 'order' | 'request'};

export default function NotificationsPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [showPermissionCard, setShowPermissionCard] = useState(true);
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
        const fetchedNotifications: Notification[] = [];

        // 1. Get unread orders where user is the BUYER
        const buyerOrdersQuery = query(
          collection(firestore, 'orders'),
          where('customerId', '==', user.uid),
          where('buyerHasUnread', '==', true)
        );
        const buyerOrdersSnapshot = await getDocs(buyerOrdersQuery);
        buyerOrdersSnapshot.forEach(doc => {
          fetchedNotifications.push({ ...(doc.data() as Order), id: doc.id, type: 'order' });
        });
        
        // 2. Get unread orders where user is the SELLER (via store ownership)
        const storesRef = collection(firestore, 'stores');
        const storeQuery = query(storesRef, where('userId', '==', user.uid));
        const storeSnapshot = await getDocs(storeQuery);
        const storeIds = storeSnapshot.docs.map(doc => doc.id);

        if (storeIds.length > 0) {
            const sellerOrdersQuery = query(
              collection(firestore, 'orders'),
              where('storeId', 'in', storeIds),
              where('sellerHasUnread', '==', true)
            );
            const sellerOrdersSnapshot = await getDocs(sellerOrdersQuery);
            sellerOrdersSnapshot.forEach(doc => {
              fetchedNotifications.push({ ...(doc.data() as Order), id: doc.id, type: 'order' });
            });
        }
            
        // 3. Get unread service requests where user is the PROVIDER
        const serviceRequestsQuery = query(
          collection(firestore, 'serviceRequests'),
          where('providerId', '==', user.uid),
          where('providerHasUnread', '==', true)
        );
        const serviceRequestsSnapshot = await getDocs(serviceRequestsQuery);
        serviceRequestsSnapshot.forEach(doc => {
          fetchedNotifications.push({ ...(doc.data() as ServiceRequest), id: doc.id, type: 'request' });
        });
        
        
        // Sort all combined notifications by date on the client-side
        fetchedNotifications.sort((a, b) => {
            const dateA = new Date((a as any).orderDate || (a as any).requestDate);
            const dateB = new Date((b as any).orderDate || (b as any).requestDate);
            return dateB.getTime() - dateA.getTime();
        });


        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Erro ao buscar notificações.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, firestore, isUserLoading]);


  const handlePermissionRequest = (allow: boolean) => {
    setShowPermissionCard(false);
    if (allow) {
        toast.success("Você será avisado sobre novos pedidos e atualizações.");
    } else {
         toast("Você pode ativá-las depois nas configurações do seu perfil.", { icon: 'ℹ️' });
    }
  }

  const renderSkeleton = () => (
    <div className="p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
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
      <main className="flex-1 overflow-y-auto p-4">
        {showPermissionCard && (
             <Card className="mb-6 bg-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Info className="h-5 w-5 text-primary" />
                        Ative as Notificações
                    </CardTitle>
                    <CardDescription>
                        Receba alertas sonoros e pop-ups sobre seus pedidos em tempo real.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex gap-4">
                    <Button className="flex-1" onClick={() => handlePermissionRequest(true)}>Ativar</Button>
                    <Button variant="ghost" className="flex-1" onClick={() => handlePermissionRequest(false)}>Agora não</Button>
                </CardFooter>
            </Card>
        )}

        {isLoading ? renderSkeleton() : (
            notifications && notifications.length > 0 ? (
                <div className="divide-y">
                    {notifications.map(notification => {
                        const isOrder = notification.type === 'order';
                        const href = isOrder ? `/pedidos/${notification.id}` : `/vender/solicitacoes/${notification.id}`;
                        const isSellerNotification = (isOrder && (notification as Order).customerId !== user?.uid) || !isOrder;
                        const date = isOrder ? (notification as Order).orderDate : (notification as ServiceRequest).requestDate;

                        return (
                        <Link href={href} key={notification.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                {isOrder ? <Package className="h-5 w-5 text-primary" /> : <Wrench className="h-5 w-5 text-primary" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    {isSellerNotification ? (
                                        isOrder ? (
                                            <>
                                                Você recebeu um novo pedido! <span className="font-bold">#{notification.id.substring(0,7)}</span>.
                                            </>
                                        ) : (
                                            <>
                                                Nova solicitação para o serviço <span className="font-bold">{(notification as ServiceRequest).serviceName}</span>.
                                            </>
                                        )
                                    ) : (
                                        <>
                                            O status do seu pedido <span className="font-bold">#{notification.id.substring(0,7)}</span> foi atualizado para <span className="font-semibold text-accent">{(notification as Order).status}</span>.
                                        </>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })}
                                </p>
                            </div>
                        </Link>
                        )
                    })}
                </div>
            ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-4 h-full">
                    <Bell className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Nenhuma notificação nova</h2>
                    <p className="text-muted-foreground">
                    Suas notificações sobre pedidos aparecerão aqui.
                    </p>
                </div>
            )
        )}
      </main>
    </div>
  );
}
