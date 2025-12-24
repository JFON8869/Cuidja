'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import {
  Store as StoreIcon,
  PlusCircle,
  Package,
  ClipboardList,
  ChevronRight,
  Wrench,
  Loader2,
  DollarSign,
  Hash,
  Calculator,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WithId } from '@/firebase/firestore/use-collection';
import { Store, OrderType } from '@/lib/data';
import BottomNav from '@/components/layout/BottomNav';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderData {
    status: string;
    totalAmount: number;
    orderType: OrderType;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
}

export default function VenderPage() {
  const { user, isUserLoading, store, isStoreLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading || isStoreLoading) {
      return;
    }
    if (!user) {
      router.push('/login?redirect=/vender');
      return;
    }
    if (!store) {
      router.push('/vender/loja');
    }
  }, [user, store, isUserLoading, isStoreLoading, router]);

  if (isUserLoading || isStoreLoading) {
    return <VenderSkeleton />;
  }

  if (store) {
    return <SellerDashboard store={store} />;
  }
  
  return <VenderSkeleton />;
}

function VenderSkeleton() {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="border-b p-4">
        <h1 className="font-headline text-xl">Painel do Vendedor</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function SellerDashboard({ store }: { store: WithId<Store> }) {
  const { user, firestore } = useFirebase();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  useEffect(() => {
    async function fetchDashboardMetrics() {
        if (!firestore || !store) return;
        
        setIsLoadingMetrics(true);
        
        try {
            const ordersQuery = query(
                collection(firestore, 'orders'),
                where('storeId', '==', store.id)
            );
            
            const querySnapshot = await getDocs(ordersQuery);
            const orders = querySnapshot.docs.map(doc => doc.data() as OrderData);

            const completedPurchases = orders.filter(
                order => order.orderType === 'PURCHASE' && (order.status === 'Entregue' || order.status === 'Concluído')
            );
            
            const totalRevenue = completedPurchases.reduce((acc, order) => acc + order.totalAmount, 0);
            const totalOrders = orders.length;
            const averageTicket = totalOrders > 0 ? totalRevenue / completedPurchases.length : 0;
            
            setMetrics({
                totalRevenue,
                totalOrders,
                averageTicket
            });

        } catch (error) {
            console.error("Error fetching dashboard metrics: ", error);
        } finally {
            setIsLoadingMetrics(false);
        }
    }
    fetchDashboardMetrics();
  }, [firestore, store]);


  const menuItems = [
    {
      href: `/vender/novo-anuncio`,
      label: 'Criar Novo Anúncio',
      icon: PlusCircle,
    },
    { href: '/vender/produtos', label: 'Gerenciar Produtos', icon: Package },
    { href: '/vender/servicos', label: 'Gerenciar Serviços', icon: Wrench },
    { href: `/pedidos`, label: 'Visualizar Pedidos', icon: ClipboardList },
    { href: `/vender/loja`, label: 'Editar Dados da Loja', icon: StoreIcon },
  ];

  const kpiCards = [
    {
        title: "Faturamento Total",
        value: metrics?.totalRevenue,
        icon: DollarSign,
        format: (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    },
    {
        title: "Total de Pedidos",
        value: metrics?.totalOrders,
        icon: Hash,
        format: (value: number) => value.toString()
    },
    {
        title: "Ticket Médio",
        value: metrics?.averageTicket,
        icon: Calculator,
        format: (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }
  ]

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="border-b p-4">
        <h1 className="font-headline text-xl">Painel do Vendedor</h1>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">{store.name}</CardTitle>
              <CardDescription>
                Bem-vindo(a) de volta, {user?.displayName?.split(' ')[0]}!
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4 px-4">
            {kpiCards.map(kpi => (
                <Card key={kpi.title}>
                    <CardHeader>
                        <CardDescription className="flex items-center gap-1.5 text-xs"><kpi.icon size={14}/> {kpi.title}</CardDescription>
                        <CardTitle>
                            {isLoadingMetrics ? (
                                <Skeleton className="h-7 w-20" />
                            ) : (
                                kpi.format(kpi.value || 0)
                            )}
                        </CardTitle>
                    </CardHeader>
                </Card>
            ))}
        </div>

        <div className="mx-4 mt-6 flex flex-col border-y">
          {menuItems.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="flex items-center gap-4 border-b p-4 transition-colors hover:bg-muted/50"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="flex-1 text-base">{item.label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
