
'use client';
import Link from 'next/link';
import { Wrench, Bell, Siren } from 'lucide-react';
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
import { cn } from '@/lib/utils';

// This component is now for a separate collection: serviceRequests
interface ServiceRequest {
  id: string;
  requestDate: string;
  serviceName: string;
  status: string;
  providerHasUnread?: boolean;
}

export function ServiceOrdersList() {
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
        setStoreId(querySnapshot.docs[0].id);
      }
      setStoreLoading(false);
    }
    fetchStoreId();
  }, [firestore, user]);
  
  const requestsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !storeId) return null;
    return query(
      collection(firestore, 'serviceRequests'),
      where('storeId', '==', storeId),
      orderBy('requestDate', 'desc')
    );
  }, [firestore, user, storeId]);

  const { data: requests, isLoading: areRequestsLoading } = useCollection<ServiceRequest>(
    requestsQuery
  );

  const isLoading = isUserLoading || areRequestsLoading || isStoreLoading;
  
  const renderSkeleton = () => (
    <div className="space-y-4 p-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/f_ll" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <div className="h-full">
      {requests && requests.length > 0 ? (
        <div className="space-y-4 p-4">
          {requests.map((request) => (
            // The link should go to a new page for service request details
            <Link key={request.id} href={`/vender/solicitacoes/${request.id}`} passHref>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Solicitação #{request.id.substring(0, 7)}
                      </CardTitle>
                      <CardDescription>
                        {format(
                          new Date(request.requestDate),
                          "dd 'de' MMMM 'de' yyyy, 'às' HH:mm",
                          { locale: ptBR }
                        )}
                      </CardDescription>
                    </div>
                    {request.providerHasUnread && (
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
                <CardContent className="space-y-2 text-sm">
                   <p className="font-semibold">{request.serviceName}</p>
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
          <Wrench className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Nenhuma solicitação</h2>
          <p className="mb-4 text-muted-foreground">
            Quando um cliente solicitar um serviço, aparecerá aqui.
          </p>
          <Button asChild>
            <Link href="/vender/novo-servico">Anunciar Serviço</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
