
'use client';

import { useParams, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockCategories } from '@/lib/data';
import { StoreCard } from '@/components/store/StoreCard';
import { useEffect } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface StoreDocument {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { firestore } = useFirebase();

  // Redirect 'servicos' slug to its dedicated page
  useEffect(() => {
    if (slug === 'servicos') {
      redirect('/categorias/servicos');
    }
  }, [slug]);

  const category = mockCategories.find((cat) => cat.slug === slug);
  
  const storesQuery = useMemoFirebase(() => {
    if (!firestore || !category) return null;
    return query(
      collection(firestore, 'stores'),
      where('category', '==', category.name)
    );
  }, [firestore, category]);

  const { data: stores, isLoading } = useCollection<WithId<StoreDocument>>(storesQuery);

  if (slug === 'servicos') {
    return null; 
  }
  
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
        <h1 className="mx-auto font-headline text-xl">
          {category?.name || 'Categoria'}
        </h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          renderSkeleton()
        ) : stores && stores.length > 0 ? (
          <div className="space-y-4">
            {stores.map((store) => (
              <StoreCard 
                key={store.id} 
                store={{
                   id: store.id,
                   name: store.name,
                   category: store.category,
                   logo: {
                     id: store.id,
                     imageUrl: store.logoUrl || '/placeholder.png', // Fallback
                     imageHint: 'store logo',
                     description: `Logo for ${store.name}`
                   }
                }} 
              />
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
