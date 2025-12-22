'use client';
import Link from 'next/link';
import { ArrowLeft, Bell, Package, ShoppingCart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { getDocs } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';


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

export default function NotificationsPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isStoreLoading, setStoreLoading] = useState(true);
  const [showPermissionCard, setShowPermissionCard] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStoreId() {
      if (!firestore || !user) {
        setStoreLoading(false);
        return;
      }
      setStoreLoading(true);
      const storesRef = collection(firestore, 'stores');
      const q = query(storesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setStoreId(querySnapshot.docs[0].id);
      }
      setStoreLoading(false);
    }
    if (!isUserLoading) {
      fetchStoreId();
    }
  }, [firestore, user, isUserLoading]);

  // Notifications for the user as a buyer
  const buyerNotificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('customerId', '==', user.uid),
      where('buyerHasUnread', '==', true),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, user]);

  // Notifications for the user as a seller
  const sellerNotificationsQuery = useMemoFirebase(() => {
    if (!firestore || !storeId) return null;
    return query(
      collection(firestore, 'orders'),
      where('storeId', '==', storeId),
      where('sellerHasUnread', '==', true),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, storeId]);

  const { data: buyerNotifications, isLoading: buyerLoading } = useCollection<Order>(buyerNotificationsQuery);
  const { data: sellerNotifications, isLoading: sellerLoading } = useCollection<Order>(sellerNotificationsQuery);

  const allNotifications = [...(buyerNotifications || []), ...(sellerNotifications || [])].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  const isLoading = isUserLoading || isStoreLoading || buyerLoading || sellerLoading;

  const handlePermissionRequest = (allow: boolean) => {
    setShowPermissionCard(false);
    if (allow) {
        toast({
            title: "Notificações Ativadas!",
            description: "Você será avisado sobre novos pedidos e atualizações."
        })
    } else {
         toast({
            title: "Notificações não ativadas.",
            description: "Você pode ativá-las depois nas configurações do seu perfil."
        })
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
            allNotifications && allNotifications.length > 0 ? (
                <div className="divide-y">
                    {allNotifications.map(notification => (
                        <Link href={`/pedidos/${notification.id}`} key={notification.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                {notification.sellerHasUnread ? (
                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                ) : (
                                    <Package className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm">
                                    {notification.sellerHasUnread ? (
                                        <>
                                            Você tem um novo pedido! <span className="font-bold">#{notification.id.substring(0,7)}</span>.
                                        </>
                                    ) : (
                                        <>
                                            O status do seu pedido <span className="font-bold">#{notification.id.substring(0,7)}</span> foi atualizado para <span className="font-semibold text-accent">{notification.status}</span>.
                                        </>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notification.orderDate), { addSuffix: true, locale: ptBR })}
                                </p>
                            </div>
                        </Link>
                    ))}
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
