'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Frown, Loader2 } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { Product } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { WithId } from '@/firebase/firestore/use-collection';

type ProductWithId = WithId<Product>;

export default function MaisVendidosPage() {
  const { firestore } = useFirebase();
  const [mostSoldProducts, setMostSoldProducts] = useState<ProductWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMostSold() {
      if (!firestore) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        // 1. Fetch all orders
        const ordersQuery = query(collection(firestore, 'orders'));
        const ordersSnapshot = await getDocs(ordersQuery);

        if (ordersSnapshot.empty) {
          setMostSoldProducts([]);
          setIsLoading(false);
          return;
        }

        // 2. Count product occurrences
        const productCounts = new Map<string, number>();
        ordersSnapshot.forEach((orderDoc) => {
          const items = orderDoc.data().items as any[];
          items.forEach((item) => {
            const productId = item.id;
            productCounts.set(productId, (productCounts.get(productId) || 0) + 1);
          });
        });

        if (productCounts.size === 0) {
            setMostSoldProducts([]);
            setIsLoading(false);
            return;
        }

        // 3. Sort products by count
        const sortedProductIds = [...productCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map((entry) => entry[0]);

        // 4. Fetch product documents for the sorted IDs
        const productPromises = sortedProductIds.map(id => 
            getDocs(query(collection(firestore, 'products'), where('__name__', '==', id)))
        );
        const productSnapshots = await Promise.all(productPromises);
        
        const products: ProductWithId[] = productSnapshots
            .flat()
            .map(snap => {
                if (!snap.docs[0]) return null;
                const doc = snap.docs[0];
                return { id: doc.id, ...doc.data() } as ProductWithId;
            })
            .filter((p): p is ProductWithId => p !== null);

        setMostSoldProducts(products);

      } catch (error) {
        console.error('Failed to fetch most sold products:', error);
        // This might fail due to permissions, but we'll show an empty state if so.
        setMostSoldProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMostSold();
  }, [firestore]);

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Produtos Mais Vendidos</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          renderSkeleton()
        ) : mostSoldProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {mostSoldProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Frown className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Nenhum produto encontrado</h2>
            <p className="text-muted-foreground">
              Ainda não há dados de vendas para mostrar os produtos mais populares.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
