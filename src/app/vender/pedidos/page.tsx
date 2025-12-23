'use client';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Bell, Siren, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
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
import { toast } from 'react-hot-toast';


interface CombinedItem {
  id: string;
  date: string;
  items?: any[];
  status: string;
  totalAmount?: number;
  sellerHasUnread?: boolean;
  type: 'order' | 'service';
  name: string;
  isUrgent?: boolean;
}

export default function SellerOrdersPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isStoreLoading, setStoreLoading] = useState(true);
  const [combinedList, setCombinedList] = useState<CombinedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStoreId() {
      if (!firestore || !user) {
        if (!isUserLoading) setStoreLoading(false);
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
  }, [firestore, user, isUserLoading]);

  useEffect(() => {
    if (isUserLoading || isStoreLoading) return;
    if (!storeId) {
      setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const ordersQuery = query(
          collection(firestore, 'orders'),
          where('storeId', '==', storeId),
          orderBy('orderDate', 'desc')
        );
        const requestsQuery = query(
          collection(firestore, 'serviceRequests'),
          where('storeId', '==', storeId),
          orderBy('requestDate', 'desc')
        );

        const [ordersSnapshot, requestsSnapshot] = await Promise.all([
            getDocs(ordersQuery),
            getDocs(requestsQuery),
        ]);

        const orders = ordersSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          type: 'order' as const,
          date: doc.data().orderDate,
          name: `Pedido #${doc.id.substring(0, 7)}`,
        }));

        const requests = requestsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          type: 'service' as const,
          date: doc.data().requestDate,
          name: `Solicitação: ${doc.data().serviceName}`,
          items: [{ name: doc.data().serviceName }],
        }));
        
        const allItems = [...orders, ...requests];
        allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setCombinedList(allItems as CombinedItem[]);

      } catch (error) {
        console.error("Failed to fetch seller's items:", error);
        toast.error("Não foi possível carregar seus pedidos e solicitações.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAll();

  }, [firestore, storeId, isUserLoading, isStoreLoading]);

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
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-6 w-1/4" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  if (isUserLoading || isStoreLoading) {
    return (
        <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
             <header className="flex items-center border-b p-4">
                <Button variant="ghost" size="icon" asChild>
                <Link href="/vender">
                    <ArrowLeft />
                </Link>
                </Button>
                <h1 className="mx-auto font-headline text-xl">Pedidos e Solicitações</h1>
                <div className="w-10"></div>
            </header>
            <main className="flex-1 overflow-y-auto">{renderSkeleton()}</main>
        </div>
    )
  }

  if (!user && !isLoading) {
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
    );
  }
  
  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Pedidos e Solicitações</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          renderSkeleton()
        ) : combinedList && combinedList.length > 0 ? (
          <div className="space-y-4 p-4">
            {combinedList.map((item) => {
                const href = item.type === 'order' 
                    ? `/pedidos/${item.id}` 
                    : `/pedidos/${item.id}?type=service`;

                return (
                    <Link key={item.id} href={href} passHref>
                        <Card
                        className={cn(
                            'cursor-pointer transition-colors hover:bg-muted/50',
                            item.isUrgent && item.type === 'order' && 'border-destructive'
                        )}
                        >
                        {item.isUrgent && item.type === 'order' && (
                            <div className="flex w-full items-center justify-center gap-2 bg-destructive py-1 text-center text-sm font-bold text-destructive-foreground">
                            <Siren className="h-4 w-4" />
                            PEDIDO URGENTE
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex items-start justify-between">
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
                                        "dd/MM/yyyy 'às' HH:mm",
                                        { locale: ptBR }
                                    )}
                                    </CardDescription>
                                </div>
                            </div>
                            {item.sellerHasUnread && (
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
                        <CardContent className="space-y-2 text-sm pl-14">
                            <p className="font-semibold">{item.items?.[0]?.name}</p>
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
          <div className="flex h-[50vh] flex-col items-center justify-center p-4 text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">Nenhum pedido recebido</h2>
            <p className="mb-4 text-muted-foreground">
              Quando você receber um pedido ou solicitação, ele aparecerá aqui.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
