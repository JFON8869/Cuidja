
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { mockStores, mockServices } from '@/lib/data';
import { StoreCard } from '@/components/store/StoreCard';

export default function ServicesCategoryPage() {
  const serviceProviders = mockStores.filter(
    (store) => store.category === 'Serviços'
  );

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
        {serviceProviders.length > 0 ? (
          <div className="space-y-4">
            {serviceProviders.map((store) => (
              <StoreCard key={store.id} store={store} />
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
