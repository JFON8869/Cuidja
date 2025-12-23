
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreCard } from '@/components/store/StoreCard';
import { useEffect, useState, useMemo } from 'react';
import { allCategories } from '@/lib/categories';
import { OperatingHours } from '@/lib/data';
import BottomNav from '@/components/layout/BottomNav';

interface StoreDocument {
  id: string;
  name: string;
  logoUrl?: string;
  operatingHours?: OperatingHours;
  categories?: string[];
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { firestore } = useFirebase();
  const router = useRouter();

  const [stores, setStores] = useState<StoreDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Find the category object from allCategories based on the slug.
  const category = useMemo(
    () => allCategories.find((cat) => cat.slug === slug),
    [slug]
  );
  
  const categoryName = useMemo(() => {
    if (category) {
      return category.name;
    }
    // Fallback logic in case category is not in allCategories
    const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ');
    return decodedSlug.replace(/\b\w/g, (l) => l.toUpperCase());
  }, [slug, category]);

  useEffect(() => {
    if (slug === 'servicos') {
      router.replace('/categorias/servicos');
      return;
    }

    async function fetchStoresByCategory() {
      if (!firestore || !categoryName) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        // Query stores that contain the category name in their `categories` array field
        const storesQuery = query(
          collection(firestore, 'stores'),
          where('categories', 'array-contains', categoryName)
        );
        const storesSnapshot = await getDocs(storesQuery);

        if (storesSnapshot.empty) {
          setStores([]);
          setIsLoading(false);
          return;
        }

        const fetchedStores = storesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as StoreDocument[];

        setStores(fetchedStores);
      } catch (error) {
        console.error('Failed to fetch stores by category:', error);
        setStores([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoresByCategory();
  }, [firestore, categoryName, slug, router]);

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <Skeleton className="h-20 w-20 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">{categoryName}</h1>
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
                store={store}
                categoryName={categoryName}
                categorySlug={slug}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Frown className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Nenhuma loja encontrada</h2>
            <p className="text-muted-foreground">
              Ainda não há lojas nesta categoria.
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
