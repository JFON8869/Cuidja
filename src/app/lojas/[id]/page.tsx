'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, MapPin, Package, Wrench } from 'lucide-react';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { useEffect, useState, useMemo, useCallback } from 'react';

import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Store, Product } from '@/lib/data';
import { WithId } from '@/firebase/firestore/use-collection';
import { isStoreOpen } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StorePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.id as string;
  const initialCategory = searchParams.get('category');
  const { firestore } = useFirebase();

  const [products, setProducts] = useState<WithId<Product>[]>([]);
  const [services, setServices] = useState<WithId<Product>[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);

  const storeRef = useMemoFirebase(() => {
    if (!firestore || !storeId) return null;
    return doc(firestore, 'stores', storeId);
  }, [firestore, storeId]);

  const { data: store, isLoading: isStoreLoading } = useDoc<Store>(storeRef);

  const fetchItems = useCallback(async () => {
    if (!firestore || !storeId) {
      setIsItemsLoading(false);
      return;
    }
    setIsItemsLoading(true);
    try {
      // Fetch Products
      const productsQuery = query(
        collection(firestore, 'products'),
        where('storeId', '==', storeId),
        where('type', '==', 'PRODUCT')
      );
      const productsSnapshot = await getDocs(productsQuery);
      setProducts(
        productsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as WithId<Product>)
        )
      );

      // Fetch Services
      const servicesQuery = query(
        collection(firestore, 'products'),
        where('storeId', '==', storeId),
        where('type', '==', 'SERVICE')
      );
      const servicesSnapshot = await getDocs(servicesQuery);
      setServices(
        servicesSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as WithId<Product>)
        )
      );
    } catch (error) {
      console.error('Failed to fetch store items:', error);
      // Handle error, e.g., show a toast notification
    } finally {
      setIsItemsLoading(false);
    }
  }, [firestore, storeId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const genericLogo = PlaceHolderImages.find(
    (p) => p.id === 'generic-store-logo'
  );
  const isOpen = store ? isStoreOpen(store.operatingHours) : false;

  const isLoading = isStoreLoading || isItemsLoading;

  const hasProducts = products && products.length > 0;
  const hasServices = services && services.length > 0;

  const getDefaultTab = () => {
    if (initialCategory === 'servicos' && hasServices) {
      return 'services';
    }
    if (hasProducts) {
      return 'products';
    }
    if (hasServices) {
      return 'services';
    }
    return 'products';
  };

  const defaultTab = getDefaultTab();

  if (isLoading) {
    return <StorePageSkeleton />;
  }

  if (!store) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold">Loja não encontrada</h2>
        <p className="text-muted-foreground">
          O link que você seguiu pode estar quebrado ou a loja foi removida.
        </p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/home">Voltar ao Início</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-background shadow-2xl">
      <header className="relative h-32">
        <Image
          src={
            store.bannerUrl ||
            'https://picsum.photos/seed/store-banner/600/200'
          }
          alt={`Banner da loja ${store.name}`}
          fill
          className="object-cover"
          data-ai-hint="store banner"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-2 left-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
            asChild
          >
            <Link
              href={initialCategory ? `/categorias/${initialCategory}` : '/home'}
            >
              <ArrowLeft />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="-mt-16 px-4">
          <div className="flex items-end gap-4">
            <Image
              src={
                store.logoUrl ||
                genericLogo?.imageUrl ||
                `https://picsum.photos/seed/${store.id}/128`
              }
              alt={`Logo da ${store.name}`}
              width={100}
              height={100}
              className="h-24 w-24 rounded-lg border-4 border-background bg-muted object-cover"
              data-ai-hint="store logo"
            />
            <Badge
              variant={isOpen ? 'default' : 'secondary'}
              className={
                isOpen
                  ? 'border-green-600 bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }
            >
              <Clock className="mr-1.5 h-3 w-3" />
              {isOpen ? 'Aberto' : 'Fechado'}
            </Badge>
          </div>

          <h1 className="mt-4 font-headline text-3xl">{store.name}</h1>

          {store.address && (
            <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{store.address}</span>
            </p>
          )}
        </div>

        <div className="mt-6">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" disabled={!hasProducts}>
                <Package className="mr-2 h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="services" disabled={!hasServices}>
                <Wrench className="mr-2 h-4 w-4" />
                Serviços
              </TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="p-4">
              {hasProducts ? (
                <div className="grid grid-cols-2 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p>Esta loja ainda não tem produtos cadastrados.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="services" className="p-4">
              {hasServices ? (
                <div className="grid grid-cols-2 gap-4">
                  {services.map((service) => (
                    <ProductCard key={service.id} product={service} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p>Esta loja ainda não tem serviços cadastrados.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function StorePageSkeleton() {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-background shadow-2xl">
      <header className="relative h-32 bg-muted">
        <div className="absolute top-2 left-2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
      <main className="flex-1">
        <div className="-mt-16 px-4">
          <div className="flex items-end gap-4">
            <Skeleton className="h-24 w-24 rounded-lg border-4 border-background" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-8 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
        <div className="mt-6 p-4">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
