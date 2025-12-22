
'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Loader2,
  Package,
  Wrench,
} from 'lucide-react';
import React, { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { type Product, mockCategories } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Separator } from '@/components/ui/separator';

type ProductWithId = WithId<Product>;

interface StoreDocument {
  id: string;
  name: string;
  logoUrl?: string;
  userId: string;
}

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const categoryFilterSlug = searchParams.get('category');

  const category = useMemo(() => {
    if (!categoryFilterSlug) return null;
    return mockCategories.find((cat) => cat.slug === categoryFilterSlug);
  }, [categoryFilterSlug]);

  const categoryName = category?.name;
  
  const { firestore } = useFirebase();

  const storeRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'stores', id);
  }, [firestore, id]);

  const { data: store, isLoading: isLoadingStore } =
    useDoc<StoreDocument>(storeRef);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    
    let q = query(collection(firestore, 'products'), where('storeId', '==', id));
    
    if (categoryName) {
      q = query(q, where('category', '==', categoryName));
    }
    return q;
  }, [firestore, id, categoryName]);
  
  const { data: storeProducts, isLoading: areProductsLoading } =
    useCollection<ProductWithId>(productsQuery);
    
  const isLoading = isLoadingStore || areProductsLoading;
  
  const hasProducts = storeProducts && storeProducts.length > 0;
  const pageTitle = store?.name ? (categoryName ? `${store.name} - ${categoryName}` : store.name) : 'Loja';
  
  const products = useMemo(() => storeProducts?.filter(p => p.category !== 'Serviços') || [], [storeProducts]);
  const services = useMemo(() => storeProducts?.filter(p => p.category === 'Serviços') || [], [storeProducts]);

  if (!store && !isLoadingStore) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center bg-transparent p-4 text-center shadow-2xl">
        <h2 className="text-2xl font-bold">Loja não encontrada</h2>
        <p className="text-muted-foreground">
          A loja que você está procurando não existe.
        </p>
        <Button asChild variant="link" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="flex items-center border-b p-4">
          <Loader2 className="h-8 w-8 animate-spin" />
        </header>
        <main className="flex-1 space-y-6 p-4">
            <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-muted animate-pulse"></div>
                <div className="h-6 w-40 bg-muted animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-48 w-full bg-muted animate-pulse rounded-lg"></div>
                <div className="h-48 w-full bg-muted animate-pulse rounded-lg"></div>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="mx-auto flex items-center gap-3 truncate">
          <Avatar>
            <AvatarImage src={store?.logoUrl} alt={store?.name} />
            <AvatarFallback>{store?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h1 className="truncate font-headline text-xl">{pageTitle}</h1>
        </div>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 space-y-6 overflow-y-auto p-4">
        {products.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-headline text-2xl">
              <Package className="h-6 w-6" />
              Produtos
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {products.length > 0 && services.length > 0 && <Separator />}

        {services.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-headline text-2xl">
              <Wrench className="h-6 w-6" />
              Serviços
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {services.map((service) => (
                <ProductCard key={service.id} product={service} />
              ))}
            </div>
          </section>
        )}

        {!hasProducts && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Nenhum item encontrado</h2>
            <p className="text-muted-foreground">
              Esta loja ainda não tem itens para exibir nesta categoria.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
