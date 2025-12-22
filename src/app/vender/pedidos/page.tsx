'use client';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Bell } from 'lucide-react';
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

interface Order extends WithId<any> {
  id: string;
  orderDate: string;
  productIds: string[];
  status: string;
  totalAmount: number;
  sellerHasUnreadMessages?: boolean;
}

export default function SellerOrdersPage() {
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
        // Assuming one user has one store
        setStoreId(querySnapshot.docs[0].id);
      } else {
        setStoreId(null);
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

  const { data: orders, isLoading: areOrdersLoading } =
    useCollection<Order>(ordersQuery);

  const isLoading = isUserLoading || isStoreLoading || areOrdersLoading;

  const renderSkeleton = () => (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-6 w-1/4" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderNoStore = () => (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold">Nenhuma loja encontrada</h2>
      <p className="text-muted-foreground">
        Você precisa criar uma loja para ver suas vendas.
      </p>
    </div>
  );

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Minhas Vendas</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          renderSkeleton()
        ) : !user ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <h2 className="mb-2 text-2xl font-bold">
              Faça login para ver suas vendas
            </h2>
            <p className="mb-4 text-muted-foreground">
              Você precisa estar logado como vendedor.
            </p>
            <Button asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>
        ) : !storeId && !isStoreLoading ? (
          renderNoStore()
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4 p-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/pedidos/${order.id}`} passHref>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
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
                       {order.sellerHasUnreadMessages && (
                        <div className="relative">
                          <Bell className="h-5 w-5 text-accent" />
                          <span className="absolute -right-1 -top-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>Itens: {order.productIds.length}</p>
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
            <h2 className="mb-2 text-2xl font-bold">Nenhuma venda ainda</h2>
            <p className="mb-4 text-muted-foreground">
              Quando você receber um pedido, ele aparecerá aqui.
            </p>
            <Button asChild>
              <Link href="/vender/novo-produto">Anunciar produto</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
