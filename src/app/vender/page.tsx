'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Store as StoreIcon,
  PlusCircle,
  Package,
  ClipboardList,
  ChevronRight,
  Info,
  Wrench,
  Loader2,
} from 'lucide-react';

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
import { Store } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BottomNav from '@/components/layout/BottomNav';

export default function VenderPage() {
  const { user, isUserLoading, store, isStoreLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is finished before checking auth/store.
    if (isUserLoading || isStoreLoading) {
      return;
    }

    // If user is not authenticated, redirect to login.
    if (!user) {
      router.push('/login?redirect=/vender');
      return;
    }

    // If user is authenticated but has no store, redirect to create one.
    if (!store) {
      router.push('/vender/loja');
    }
  }, [user, store, isUserLoading, isStoreLoading, router]);

  // Show a loading spinner while user and store data are being fetched.
  if (isUserLoading || isStoreLoading) {
    return <VenderSkeleton />;
  }

  // If user and store exist, render the main dashboard.
  // The useEffect handles the redirection, but we might still render the dashboard
  // for a frame, so we only render it if the store exists.
  if (store) {
    return <SellerDashboard store={store} />;
  }
  
  // Render skeleton during the redirection phase to avoid content flash.
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
  const menuItems = [
    {
      href: `/vender/novo-anuncio`,
      label: 'Criar Novo Anúncio',
      icon: PlusCircle,
    },
    { href: '/vender/produtos', label: 'Gerenciar Produtos', icon: Package },
    { href: '/vender/servicos', label: 'Gerenciar Serviços', icon: Wrench },
    { href: `/vender/loja`, label: 'Editar Dados da Loja', icon: StoreIcon },
  ];

  const { user } = useFirebase();

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
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Próximos Passos</AlertTitle>
                <AlertDescription>
                  As seções de Pedidos e Desempenho estão em desenvolvimento e
                  serão liberadas em breve.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        <div className="mx-4 flex flex-col border-y">
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

        <div className="mt-4 space-y-4 p-4">
          <Link href="/pedidos">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Pedidos Recebidos</CardTitle>
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  Nenhum pedido novo
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
