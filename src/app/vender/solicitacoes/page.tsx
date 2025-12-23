
'use client';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Order {
  id: string;
  orderDate: string;
  items: { name: string }[];
  status: string;
  sellerHasUnread?: boolean;
}

export default function ServiceRequestsPage() {
  const { firestore, user, isUserLoading } = useFirebase();

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('sellerId', '==', user.uid),
      where('status', '==', 'Solicitação de Contato'),
      orderBy('orderDate', 'desc')
    );
  }, [firestore, user]);

  const { data: requests, isLoading } = useCollection<WithId<Order>>(
    requestsQuery
  );

  const finalIsLoading = isUserLoading || isLoading;

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
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (!user && !finalIsLoading) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <h2 className="mb-2 text-2xl font-bold">Faça login para ver suas solicitações</h2>
            <Button asChild>
                <Link href="/login">Fazer Login</Link>
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
        <h1 className="mx-auto font-headline text-xl">Solicitações de Serviço</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {finalIsLoading ? (
          renderSkeleton()
        ) : requests && requests.length > 0 ? (
          <div className="space-y-4 p-4">
            {requests.map((request) => (
              <Link key={request.id} href={`/pedidos/${request.id}`} passHref>
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {request.items[0]?.name}
                        </CardTitle>
                        <CardDescription>
                          {format(
                            new Date(request.orderDate),
                            "dd 'de' MMMM 'de' yyyy, 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </CardDescription>
                      </div>
                      {request.sellerHasUnread && (
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
                    <p className="text-muted-foreground">
                      Status:{' '}
                      <span className="font-semibold text-accent">
                        {request.status}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <Briefcase className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">Nenhuma solicitação</h2>
            <p className="mb-4 text-muted-foreground">
              Quando um cliente solicitar um serviço, aparecerá aqui.
            </p>
             <Button asChild>
              <Link href="/vender/novo-produto">Anunciar um serviço</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

    