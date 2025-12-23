
'use client';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Bell, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
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

interface CombinedItem {
  id: string;
  date: string;
  items: any[];
  status: string;
  totalAmount?: number;
  buyerHasUnread?: boolean;
  type: 'order' | 'service';
  name: string;
}

export default function OrdersPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [combinedList, setCombinedList] = useState<CombinedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || !user || !firestore) {
      if (!isUserLoading) setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        // Fetch Orders
        const ordersQuery = query(
          collection(firestore, 'orders'),
          where('customerId', '==', user.uid),
          orderBy('orderDate', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = ordersSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          type: 'order' as const,
          date: doc.data().orderDate,
          name: `Pedido #${doc.id.substring(0, 7)}`,
        }));

        // Fetch Service Requests
        const requestsQuery = query(
          collection(firestore, 'serviceRequests'),
          where('customerId', '==', user.uid),
          orderBy('requestDate', 'desc')
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        const requests = requestsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          type: 'service' as const,
          date: doc.data().requestDate,
          name: `Solicitação: ${doc.data().serviceName}`,
          items: [{ name: doc.data().serviceName }], // Normalize for display
        }));
        
        // Combine and sort
        const allItems = [...orders, ...requests];
        allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setCombinedList(allItems as CombinedItem[]);

      } catch (error) {
        console.error("Failed to fetch user's orders and requests:", error);
        toast.error("Não foi possível carregar seu histórico.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAll();

  }, [firestore, user, isUserLoading]);
  
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

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
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
          renderSkeleton()
        ) : !user ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <h2 className="mb-2 text-2xl font-bold">
              Faça login para ver seus pedidos
            </h2>
            <p className="mb-4 text-muted-foreground">
              Você precisa estar logado para acessar seu histórico de compras.
            </p>
            <Button asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>
        ) : combinedList && combinedList.length > 0 ? (
          <div className="space-y-4 p-4">
            {combinedList.map((item) => {
              const href = item.type === 'order' 
                ? `/pedidos/${item.id}` 
                : `/pedidos/${item.id}?type=service`;

              return (
              <Link key={item.id} href={href} passHref>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                         <div className="flex-shrink-0">
                           {item.type === 'order' ? <ShoppingBag className="h-6 w-6 text-muted-foreground" /> : <Briefcase className="h-6 w-6 text-muted-foreground" />}
                         </div>
                         <div>
                            <CardTitle className="text-lg">
                              {item.name}
                            </CardTitle>
                            <CardDescription>
                              {format(
                                new Date(item.date),
                                "dd 'de' MMMM 'de' yyyy, 'às' HH:mm",
                                { locale: ptBR }
                              )}
                            </CardDescription>
                         </div>
                       </div>
                       {item.buyerHasUnread && (
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
                  <CardContent className="space-y-2 text-sm pl-14">
                    <p className="text-muted-foreground">
                      Status:{' '}
                      <span className="font-semibold text-accent">
                        {item.status}
                      </span>
                    </p>
                  </CardContent>
                  {item.type === 'order' && (
                    <CardFooter className="flex items-center justify-between font-bold pl-14">
                        <span>Total</span>
                        <span>
                        {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        }).format(item.totalAmount || 0)}
                        </span>
                    </CardFooter>
                  )}
                </Card>
              </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">Nenhum pedido realizado</h2>
            <p className="mb-4 text-muted-foreground">
              Quando você fizer uma compra ou solicitação, seu histórico aparecerá aqui.
            </p>
            <Button asChild>
              <Link href="/home">Começar a comprar</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
