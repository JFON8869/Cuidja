'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  Loader2,
  Package,
  Wrench,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, or } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/layout/BottomNav';


interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  orderType: 'PURCHASE' | 'SERVICE_REQUEST';
  orderDate?: { toDate: () => Date };
  status: string;
  totalAmount?: number;
  items?: OrderItem[];
  serviceName?: string;
  storeId: string;
}

export default function MyOrdersPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Record<string, { name: string }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || !user || !firestore) {
      if (!isUserLoading) setIsLoading(false);
      return;
    }

    const fetchOrdersAndStores = async () => {
      setIsLoading(true);
      try {
        const ordersRef = collection(firestore, 'orders');
        // This query is intentionally broad and will be filtered on the client
        // to avoid complex composite indexes.
        const q = query(
          ordersRef,
          or(where('customerId', '==', user.uid), where('sellerId', '==', user.uid))
        );

        const querySnapshot = await getDocs(q);
        const allOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        // Sort combined orders by date on the client-side
        allOrders.sort((a, b) => {
          const dateA = a.orderDate?.toDate() || new Date(0);
          const dateB = b.orderDate?.toDate() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(allOrders);

        const storeIds = [...new Set(allOrders.map((order) => order.storeId))];
        if (storeIds.length > 0) {
          const fetchedStores: Record<string, { name: string }> = {};
          // Firestore 'in' query supports a maximum of 30 elements in the array.
          // We chunk the storeIds to handle more than 30 stores.
          const storeChunks = [];
          for (let i = 0; i < storeIds.length; i += 30) {
            storeChunks.push(storeIds.slice(i, i + 30));
          }
          for (const chunk of storeChunks) {
             const storesQuery = query(collection(firestore, 'stores'), where('__name__', 'in', chunk));
             const storesSnapshot = await getDocs(storesQuery);
             storesSnapshot.forEach((doc) => {
                fetchedStores[doc.id] = { name: doc.data().name };
             });
          }
          setStores(fetchedStores);
        }

      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdersAndStores();
  }, [user, firestore, isUserLoading]);
  
  const { purchaseOrders, serviceRequests } = useMemo(() => {
    const purchaseOrders = orders.filter(o => o.orderType === 'PURCHASE');
    const serviceRequests = orders.filter(o => o.orderType === 'SERVICE_REQUEST');
    return { purchaseOrders, serviceRequests };
  }, [orders]);

  const renderOrderList = (orderList: Order[]) => {
    if (orderList.length === 0) {
      return (
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Nenhum pedido aqui</h2>
          <p className="text-muted-foreground">
            Suas compras ou solicitações aparecerão nesta seção.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orderList.map((order) => {
          const isPurchase = order.orderType === 'PURCHASE';
          const date = order.orderDate?.toDate();
          const title = isPurchase ? (order.items?.[0]?.name || 'Pedido') : order.serviceName;
          const storeName = stores[order.storeId]?.name || 'Loja não encontrada';

          return (
            <Link href={`/pedidos/${order.id}`} key={order.id}>
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           {isPurchase ? <Package size={20}/> : <Wrench size={20}/>}
                           {title}
                           {isPurchase && order.items && order.items.length > 1 && ` + ${order.items.length - 1} item(s)`}
                        </CardTitle>
                        <CardDescription>{storeName}</CardDescription>
                    </div>
                     <Badge variant="secondary">{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-between text-sm">
                  <p className="text-muted-foreground">
                    {date ? format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Data indisponível'}
                  </p>
                  {isPurchase && order.totalAmount != null && (
                    <p className="font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(order.totalAmount)}
                    </p>
                  )}
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  };


  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-background pb-16 shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Meus Pedidos</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (
           <Tabs defaultValue="purchases" className="w-full">
              <TabsList className="grid w-full grid-cols-2 m-4">
                <TabsTrigger value="purchases">Compras</TabsTrigger>
                <TabsTrigger value="services">Serviços</TabsTrigger>
              </TabsList>
              <TabsContent value="purchases" className="p-4">
                {renderOrderList(purchaseOrders)}
              </TabsContent>
              <TabsContent value="services" className="p-4">
                {renderOrderList(serviceRequests)}
              </TabsContent>
            </Tabs>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
