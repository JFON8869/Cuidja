
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  Heart,
  ShoppingCart,
  Loader2,
  Package,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Product, ImagePlaceholder } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';
import { ProductOptionsSheet } from '@/components/product/ProductOptionsSheet';

function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { firestore } = useFirebase();
  const { addToCart } = useCart();
  const router = useRouter();

  const [storeName, setStoreName] = useState<string | null>(null);

  const productRef = useMemoFirebase(() => {
    if (!firestore || !productId) return null;
    return doc(firestore, 'products', productId);
  }, [firestore, productId]);

  const { data: product, isLoading, error } = useDoc<Product>(productRef);

  useEffect(() => {
    if (error) {
      console.error('Failed to load product, redirecting...', error);
      // Optional: show a toast
      router.push('/home'); // Redirect if product fails to load
    }
  }, [error, router]);

  useEffect(() => {
    async function fetchStoreName() {
      if (!firestore || !product?.storeId) return;
      const storeRef = doc(firestore, 'stores', product.storeId);
      try {
        const storeSnap = await getDoc(storeRef);
        if (storeSnap.exists()) {
          setStoreName(storeSnap.data().name);
        }
      } catch (error) {
        console.error('Failed to fetch store name:', error);
      }
    }
    fetchStoreName();
  }, [firestore, product?.storeId]);

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold">Produto não encontrado</h2>
        <p className="text-muted-foreground">
          O produto que você está procurando não existe ou foi removido.
        </p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/home">Voltar ao Início</Link>
        </Button>
      </div>
    );
  }

  const handlePrimaryAction = () => {
    if (!product.addons || product.addons.length === 0) {
      addToCart(product);
    }
    // If there are addons, the Sheet's trigger will handle opening it.
    // The logic is inside the Sheet component.
  };

  const PrimaryActionButton = (
    <Button
      size="lg"
      className="w-full"
      onClick={
        !product.addons || product.addons.length === 0
          ? handlePrimaryAction
          : undefined
      }
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      Adicionar ao Carrinho
    </Button>
  );

  const image: ImagePlaceholder | undefined = product.images?.[0];
  const defaultImage = 'https://picsum.photos/seed/product/600/600';
  const imageUrl = image?.imageUrl || defaultImage;
  const imageHint = image?.imageHint || 'product photo';

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-background shadow-2xl">
      <header className="absolute top-0 left-0 z-10 p-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
          asChild
        >
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
      </header>

      <main className="flex-1">
        <div className="relative aspect-square w-full">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="100vw"
            className="object-cover"
            data-ai-hint={imageHint}
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="-mt-16 space-y-4 p-4">
          <h1 className="font-headline text-3xl">{product.name}</h1>
          <p className="text-3xl font-bold text-primary">
            {product.price > 0
              ? new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(product.price)
              : 'A combinar'}
          </p>

          {storeName && (
            <Link
              href={`/lojas/${product.storeId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-muted p-2 text-sm font-medium transition-colors hover:bg-muted/80"
            >
              <Store className="h-4 w-4" />
              <span>Vendido por {storeName}</span>
            </Link>
          )}

          {product.description && (
            <div>
              <h2 className="mb-2 font-headline text-xl">Descrição</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 border-t bg-card p-4">
        {product.addons && product.addons.length > 0 ? (
          <ProductOptionsSheet product={product}>
            {PrimaryActionButton}
          </ProductOptionsSheet>
        ) : (
          PrimaryActionButton
        )}
      </footer>
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-background shadow-2xl">
      <header className="absolute top-0 left-0 z-10 p-2">
        <Skeleton className="h-10 w-10 rounded-full" />
      </header>
      <main className="flex-1">
        <Skeleton className="aspect-square w-full" />
        <div className="-mt-16 space-y-4 p-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </main>
      <footer className="border-t bg-card p-4">
        <Skeleton className="h-12 w-full" />
      </footer>
    </div>
  );
}

export default ProductPage;
