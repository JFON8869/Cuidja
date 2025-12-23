
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store as StoreIcon,
  PlusCircle,
  Package,
  ClipboardList,
  BarChart2,
  Construction,
  Loader2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { useFirebase, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WithId } from '@/firebase/firestore/use-collection';
import { Store } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VenderPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const [store, setStore] = useState<WithId<Store> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/login?redirect=/vender');
      return;
    }

    const fetchUserStore = async () => {
      if (!firestore) return;
      setIsLoading(true);
      const storesRef = collection(firestore, 'stores');
      const q = query(storesRef, where('userId', '==', user.uid));
      
      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const storeDoc = querySnapshot.docs[0];
          setStore({ id: storeDoc.id, ...storeDoc.data() } as WithId<Store>);
        } else {
          setStore(null);
        }
      } catch (error) {
        console.error("Failed to fetch user's store:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStore();
  }, [user, firestore, isUserLoading, router]);

  if (isLoading || isUserLoading) {
    return <VenderSkeleton />;
  }

  if (!store) {
    return <CreateStorePrompt />;
  }

  return <SellerDashboard store={store} />;
}

function VenderSkeleton() {
    return (
        <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
            <header className="p-4 border-b">
                <Skeleton className="h-7 w-32" />
            </header>
            <main className="flex-1 p-4 space-y-6">
                <Skeleton className="h-40 w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </main>
        </div>
    )
}

function CreateStorePrompt() {
  return (
     <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center bg-transparent p-6 text-center shadow-2xl">
        <header className="absolute top-0 left-0 w-full flex items-center border-b p-4">
            <h1 className="font-headline text-xl">Seja um Vendedor</h1>
        </header>
        <main>
            <StoreIcon className="mx-auto h-20 w-20 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Crie sua loja para começar</h2>
            <p className="text-muted-foreground mb-6">
                É o primeiro passo para você poder anunciar seus produtos e serviços na nossa plataforma.
            </p>
            <Button size="lg" className="w-full" asChild>
                <Link href="/vender/loja">Criar minha loja</Link>
            </Button>
        </main>
    </div>
  )
}

function SellerDashboard({ store }: { store: WithId<Store> }) {

    const menuItems = [
        { href: `/vender/novo-anuncio?storeId=${store.id}`, label: 'Criar Novo Anúncio', icon: PlusCircle },
        { href: '/vender/produtos', label: 'Gerenciar Produtos', icon: Package },
        { href: '/vender/servicos', label: 'Gerenciar Serviços', icon: ClipboardList },
        { href: `/vender/loja?storeId=${store.id}`, label: 'Editar Dados da Loja', icon: StoreIcon },
    ];

    const { user } = useFirebase();

    return (
        <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
            <header className="p-4 border-b">
                <h1 className="font-headline text-xl">Painel do Vendedor</h1>
            </header>
            <main className="flex-1 overflow-y-auto">
                <div className="p-4">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">{store.name}</CardTitle>
                            <CardDescription>Bem-vindo(a) de volta, {user?.displayName?.split(' ')[0]}!</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Próximos Passos</AlertTitle>
                                <AlertDescription>
                                    As seções de Pedidos e Desempenho estão em desenvolvimento e serão liberadas em breve.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="flex flex-col mx-4 border-y">
                    {menuItems.map((item) => (
                        <Link href={item.href} key={item.href} className="border-b p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                            <item.icon className="w-5 h-5 text-primary" />
                            <span className="flex-1 text-base">{item.label}</span>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </Link>
                    ))}
                </div>

                 <div className="p-4 mt-4 space-y-4">
                    <Link href="/vender/pedidos">
                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Pedidos Recebidos</CardTitle>
                                <BarChart2 className="w-6 h-6 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">0</p>
                                <p className="text-xs text-muted-foreground">Nenhum pedido novo</p>
                            </CardContent>
                        </Card>
                    </Link>
                 </div>
            </main>
        </div>
    )
}
