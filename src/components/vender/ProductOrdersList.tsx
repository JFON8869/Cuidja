
'use client';
import Link from 'next/link';
import { ShoppingBag, Bell, Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Order extends WithId<any> {
  id: string;
  orderDate: string;
  items: any[];
  status: string;
  totalAmount: number;
  sellerHasUnread?: boolean;
  isUrgent?: boolean;
}

export function ProductOrdersList() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isStoreLoading, setStoreLoading] = useState(true);

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
    fetchStoreId();
  }, [firestore, user]);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !storeId) return null;
    return query(
      collection(firestore, 'orders'),
      where('storeId', '==', storeId),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, storeId]);

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(
    ordersQuery
  );

  const isLoading = isUserLoading || isStoreLoading || (storeId && areOrdersLoading);

  const renderSkeleton = () => (
    <div className="space-y-4 p-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-6 w-1/4" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }
  
  if (!user) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-2 text-2xl font-bold">Faça login para ver suas vendas</h2>
        <p className="mb-4 text-muted-foreground">
            Você precisa estar logado como vendedor.
        </p>
        <Button asChild>
            <Link href="/login">Fazer Login</Link>
        </Button>
        </div>
    );
  }
  
  if (!storeId && !isStoreLoading) {
     return (
       <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <h2 className="text-2xl font-bold">Nenhuma loja encontrada</h2>
            <p className="text-muted-foreground">
                Você precisa criar uma loja para ver suas vendas.
            </p>
            <Button asChild className="mt-4">
                <Link href="/vender/loja">Criar minha loja</Link>
            </Button>
        </div>
     )
  }

  return (
    <div className="h-full">
      {orders && orders.length > 0 ? (
        <div className="space-y-4 p-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/pedidos/${order.id}`} passHref>
              <Card
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/50',
                  order.isUrgent && 'border-destructive'
                )}
              >
                {order.isUrgent && (
                  <div className="flex w-full items-center justify-center gap-2 bg-destructive py-1 text-center text-sm font-bold text-destructive-foreground">
                    <Siren className="h-4 w-4" />
                    PEDIDO URGENTE
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{order.id.substring(0, 7)}
                      </CardTitle>
                      <CardDescription>
                        {format(
                          new Date(order.orderDate),
                          "dd 'de' MMMM 'de' yyyy, 'às' HH:mm",
                          { locale: ptBR }
                        )}
                      </CardDescription>
                    </div>
                    {order.sellerHasUnread && (
                      <div className="relative">
                        <Bell className="h-5 w-5 text-accent" />
                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-accent"></span>
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Itens: {order.items.length}</p>
                  <p className="text-muted-foreground">
                    Status:{' '}
                    <span className="font-semibold text-accent">
                      {order.status}
                    </span>
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(order.totalAmount)}
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Nenhum pedido de produto</h2>
          <p className="mb-4 text-muted-foreground">
            Quando você receber um pedido, ele aparecerá aqui.
          </p>
          <Button asChild>
            <Link href="/vender/novo-produto">Anunciar produto</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
