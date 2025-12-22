'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PlusCircle,
  ShoppingBag,
  BarChart,
  Package,
  Store,
  Loader2,
  Wrench,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection } from '@/firebase/firestore/use-collection';

const salesData = [
  { name: 'Jan', sales: 65 },
  { name: 'Fev', sales: 59 },
  { name: 'Mar', sales: 80 },
  { name: 'Abr', sales: 81 },
  { name: 'Mai', sales: 56 },
  { name: 'Jun', sales: 70 },
];

export default function SellPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [store, setStore] = useState<{id: string, category: string} | null>(null);
  const [isStoreLoading, setStoreLoading] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      if (!firestore || !user) {
        if (!isUserLoading) {
            setStoreLoading(false);
        }
        return;
      }
      setStoreLoading(true);
      const storesRef = collection(firestore, 'stores');
      const q = query(storesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const storeDoc = querySnapshot.docs[0];
        setStore({ id: storeDoc.id, category: storeDoc.data().category });
      } else {
        setStore(null); // Explicitly set to null if no store found
      }
      setStoreLoading(false);
    }
    fetchStore();
  }, [user, firestore, isUserLoading]);
  
  const isServiceProvider = store?.category === 'Serviços';

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !user || isServiceProvider) return null;
    return query(
        collection(firestore, 'products'),
        where('sellerId', '==', user.uid)
    );
  }, [firestore, user, isServiceProvider]);

  const servicesQuery = useMemoFirebase(() => {
      if (!firestore || !user || !isServiceProvider) return null;
      return query(
          collection(firestore, 'services'),
          where('sellerId', '==', user.uid)
      );
  }, [firestore, user, isServiceProvider]);

  const { data: myProducts, isLoading: productsLoading } = useCollection(productsQuery);
  const { data: myServices, isLoading: servicesLoading } = useCollection(servicesQuery);

  const myProductsCount = myProducts?.length ?? 0;
  const myServicesCount = myServices?.length ?? 0;

  if (isStoreLoading || isUserLoading) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="flex items-center border-b p-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="mx-auto h-6 w-40" />
          <div className="w-10"></div>
        </header>
        <main className="flex-1 space-y-6 p-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) {
     return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="flex items-center border-b p-4">
           <Button variant="ghost" size="icon" asChild>
            <Link href="/home">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="mx-auto font-headline text-xl">Seja um Vendedor</h1>
          <div className="w-10"></div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
            <h2 className="text-2xl font-bold">Faça login para começar</h2>
            <p className="text-muted-foreground mb-6">Você precisa estar logado para criar uma loja e vender seus produtos.</p>
            <Button size="lg" asChild>
                <Link href="/login">
                    Fazer Login
                </Link>
            </Button>
        </main>
      </div>
    );
  }

  if (user && !store) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="flex items-center border-b p-4">
           <Button variant="ghost" size="icon" asChild>
            <Link href="/home">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="mx-auto font-headline text-xl">Seja um Vendedor</h1>
          <div className="w-10"></div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
            <Store className="h-20 w-20 text-muted-foreground mb-4"/>
            <h2 className="text-2xl font-bold">Crie sua loja para começar</h2>
            <p className="text-muted-foreground mb-6">O primeiro passo para vender é criar sua loja. É rápido e fácil!</p>
            <Button size="lg" asChild>
                <Link href="/vender/loja">
                    <PlusCircle className="mr-2"/>
                    Criar Minha Loja
                </Link>
            </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Painel do Vendedor</h1>
         <Button variant="ghost" size="icon" asChild>
          <Link href="/vender/loja">
            <Store />
          </Link>
        </Button>
      </header>
      <main className="flex-1 space-y-6 p-4">
        <Button size="lg" className="w-full" asChild>
            <Link href={isServiceProvider ? "/vender/novo-servico" : "/vender/novo-produto"}>
                <PlusCircle className="mr-2" />
                {isServiceProvider ? 'Anunciar Novo Serviço' : 'Anunciar Novo Produto'}
            </Link>
        </Button>
        <div className="grid grid-cols-2 gap-4">
          {isServiceProvider ? (
             <Link href="/vender/servicos">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Meus Serviços
                    </CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{servicesLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : myServicesCount}</div>
                    <p className="text-xs text-muted-foreground">Serviços ativos</p>
                  </CardContent>
                </Card>
            </Link>
          ) : (
            <Link href="/vender/produtos">
                <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Meus Produtos
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{productsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : myProductsCount}</div>
                    <p className="text-xs text-muted-foreground">Produtos ativos</p>
                </CardContent>
                </Card>
            </Link>
          )}
          <Link href="/vender/pedidos">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+R$1.234</div>
                <p className="text-xs text-muted-foreground">No último mês</p>
              </CardContent>
            </Card>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-headline">
              <BarChart className="h-5 w-5" />
              Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={salesData}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
