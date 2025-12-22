'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockCategories } from '@/lib/data';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/lib/data';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { firestore } = useFirebase();

  const category = mockCategories.find((cat) => cat.slug === slug);
  
  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !category) return null;
    return query(
      collection(firestore, 'products'),
      where('category', '==', category.name)
    );
  }, [firestore, category]);

  const { data: products, isLoading } = useCollection<WithId<Product>>(productsQuery);
  
  const renderSkeleton = () => (
    <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
             <div key={i} className="space-y-2">
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-4 w-1/4" />
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
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Frown className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">Nenhum produto encontrado</h2>
            <p className="text-muted-foreground">
              Não há produtos nesta categoria no momento.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
