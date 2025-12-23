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
  ChevronRight,
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
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const salesData = [
  { name: 'Jan', sales: 65 },
  { name: 'Fev', sales: 59 },
  { name: 'Mar', sales: 80 },
  { name: 'Abr', sales: 81 },
  { name: 'Mai', sales: 56 },
  { name: 'Jun', sales: 70 },
];

const WelcomeSellPage = () => (
  <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
     <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Comece a Vender</h1>
        <div className="w-10"></div>
      </header>
    <main className="flex flex-1 flex-col justify-between p-8 text-center">
      <div className="flex-1">
        <h2 className="font-headline text-4xl">Venda no Cuidja</h2>
        <p className="mt-4 text-lg text-muted-foreground">
            Alcance clientes perto de você e gerencie tudo em um só lugar.
        </p>
         <ul className="mt-8 space-y-4 text-left">
            <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Store className="h-5 w-5"/>
                </div>
                <div>
                    <h3 className="font-semibold">Crie sua vitrine online</h3>
                    <p className="text-sm text-muted-foreground">O primeiro passo é criar sua loja para que os clientes te encontrem.</p>
                </div>
            </li>
             <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Package className="h-5 w-5"/>
                </div>
                <div>
                    <h3 className="font-semibold">Publique produtos ou serviços</h3>
                    <p className="text-sm text-muted-foreground">Anuncie seus itens em um formulário rápido e intuitivo.</p>
                </div>
            </li>
             <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5"/>
                </div>
                <div>
                    <h3 className="font-semibold">Gerencie pedidos e solicitações</h3>
                    <p className="text-sm text-muted-foreground">Comunicação centralizada com seus clientes.</p>
                </div>
            </li>
        </ul>
      </div>
      <div className="pb-4">
        <Button size="lg" className="w-full" asChild>
            <Link href="/vender/loja">Criar minha loja</Link>
        </Button>
      </div>
    </main>
  </div>
);

export default function SellPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [store, setStore] = useState<{ id: string } | null>(null);
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
        setStore({ id: storeDoc.id, ...storeDoc.data() } as { id: string });
      } else {
        setStore(null);
      }
      setStoreLoading(false);
    }
    if (!isUserLoading) {
        fetchStore();
    }
  }, [user, firestore, isUserLoading]);

  const isLoading = isStoreLoading || isUserLoading;

  if (isLoading) {
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
    return <WelcomeSellPage />;
  }
  
  if (user && !store) {
     return <WelcomeSellPage />;
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
        <div className="w-10" />
      </header>
      <main className="flex-1 space-y-6 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          <Button size="lg" asChild>
            <Link href={'/vender/selecionar-tipo'}>
              <PlusCircle className="mr-2" />
              Novo Anúncio
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <Link href="/vender/pedidos" className="block rounded-lg border bg-card p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground"/>
                        <span className="font-semibold">Pedidos e Solicitações</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                </div>
            </Link>
             <Link href="/vender/produtos" className="block rounded-lg border bg-card p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Package className="h-6 w-6 text-muted-foreground"/>
                        <span className="font-semibold">Produtos</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                </div>
            </Link>
             <Link href="/vender/servicos" className="block rounded-lg border bg-card p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Wrench className="h-6 w-6 text-muted-foreground"/>
                        <span className="font-semibold">Serviços</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                </div>
            </Link>
             <Link href="/vender/loja" className="block rounded-lg border bg-card p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Store className="h-6 w-6 text-muted-foreground"/>
                        <span className="font-semibold">Minha Loja</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                </div>
            </Link>
        </div>
       
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-headline">
              <BarChart className="h-5 w-5" />
              Desempenho de Vendas
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
