
'use client';

import { useParams, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductContext } from '@/context/ProductContext';
import { mockCategories, mockStores } from '@/lib/data';
import { StoreCard } from '@/components/store/StoreCard';
import { useEffect } from 'react';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // If the category is "servicos", redirect to the dedicated services page
  useEffect(() => {
    if (slug === 'servicos') {
      redirect('/categorias/servicos');
    }
  }, [slug]);

  const category = mockCategories.find((cat) => cat.slug === slug);
  const categoryStores = mockStores.filter(
    (store) => store.category === category?.name
  );
  
  // This page will not render for "servicos", but as a fallback:
  if (slug === 'servicos') {
    return null; 
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          {category?.name || 'Categoria'}
        </h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {categoryStores.length > 0 ? (
          <div className="space-y-4">
            {categoryStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Nenhuma loja encontrada</h2>
            <p className="text-muted-foreground">
              Não há lojas nesta categoria no momento.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
