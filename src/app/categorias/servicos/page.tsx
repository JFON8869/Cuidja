
'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Frown } from 'lucide-react';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { StoreCard } from '@/components/store/StoreCard';
import { Skeleton } from '@/components/ui/skeleton';

interface StoreDocument {
  id: string;
  name: string;
  userId: string;
  logoUrl?: string;
}

export default function ServicesCategoryPage() {
  const { firestore } = useFirebase();
  const [serviceProviders, setServiceProviders] = useState<StoreDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchServiceProviders() {
      if (!firestore) return;
      setIsLoading(true);

      try {
        // 1. Find all services
        const servicesQuery = query(collection(firestore, 'services'));
        const servicesSnapshot = await getDocs(servicesQuery);

        if (servicesSnapshot.empty) {
          setServiceProviders([]);
          setIsLoading(false);
          return;
        }

        // 2. Get unique store IDs from these services (providerId in this case is the storeId)
        const storeIds = [
          ...new Set(servicesSnapshot.docs.map((doc) => doc.data().providerId)),
        ];

        if (storeIds.length === 0) {
          setServiceProviders([]);
          setIsLoading(false);
          return;
        }

        // 3. Fetch the store documents for each unique storeId
        const storePromises = storeIds.map((id) =>
          getDoc(doc(firestore, 'stores', id as string))
        );
        const storeDocs = await Promise.all(storePromises);

        const providers = storeDocs
          .filter((doc) => doc.exists())
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as StoreDocument[];

        setServiceProviders(providers);
      } catch (error) {
        console.error('Failed to fetch service providers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchServiceProviders();
  }, [firestore]);
  
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
                store={store}
                categoryName="Serviços"
                categorySlug="servicos"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Frown className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Nenhum prestador encontrado</h2>
            <p className="text-muted-foreground">
              Não há prestadores de serviço cadastrados no momento.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
