'use client';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderProduct {
  id: string;
  name: string;
  price: number;
}
interface Order extends WithId<any> {
    id: string;
    orderDate: string;
    products: OrderProduct[];
    status: string;
    totalAmount: number;
}

export default function OrdersPage() {
  const { firestore, user, isUserLoading } = useFirebase();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'orders'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);
  
  const renderSkeleton = () => (
    <div className="space-y-4 p-4">
        <Card>
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
    </div>
  );


  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl">
      <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto">Meus Pedidos</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {isUserLoading || isLoading ? (
            renderSkeleton()
        ) : !user ? (
          <div className="flex flex-col items-center justify-center text-center p-4 h-full">
            <h2 className="text-2xl font-bold mb-2">Faça login para ver seus pedidos</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para acessar seu histórico de compras.
            </p>
            <Button asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4 p-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Pedido #{order.id.substring(0, 7)}</CardTitle>
                  <CardDescription>
                    {format(new Date(order.orderDate), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {order.products.map((product) => (
                    <div key={product.id} className="flex justify-between">
                      <span>{product.name}</span>
                      <span className="text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount)}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 h-full">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhum pedido realizado</h2>
            <p className="text-muted-foreground mb-4">
              Quando você fizer uma compra, seus pedidos aparecerão aqui.
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
