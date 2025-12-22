
'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { StoreCard } from '@/components/store/StoreCard';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

// Define a type for the store data coming from Firestore
interface StoreDocument {
  name: string;
  category: string;
  userId: string;
  logoUrl?: string;
}

export default function ServicesCategoryPage() {
  const { firestore } = useFirebase();

  // Memoize the query to prevent re-renders. This query finds stores that offer services.
  // A better approach would be a dedicated field e.g. `offersServices: true`
  // For now, we query stores that have listed their primary category as 'Serviços'.
  // This will also include stores that offer both products and services.
  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'stores'),
      where('category', '==', 'Serviços') // This might need adjustment based on the final data model
    );
  }, [firestore]);

  // Fetch the service providers from Firestore
  const { data: serviceProviders, isLoading } =
    useCollection<WithId<StoreDocument>>(servicesQuery);
  
  const renderSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
             <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                <Skeleton className="h-20 w-20 rounded-md" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        ))}
    </div>
  )


  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Serviços</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          renderSkeleton()
        ) : serviceProviders && serviceProviders.length > 0 ? (
          <div className="space-y-4">
            {serviceProviders.map((store) => (
              <StoreCard
                key={store.id}
                store={{
                  id: store.id,
                  name: store.name,
                  category: store.category,
                  logoUrl: store.logoUrl,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Nenhum prestador encontrado</h2>
            <p className="text-muted-foreground">
              Não há prestadores de serviço nesta categoria no momento.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
