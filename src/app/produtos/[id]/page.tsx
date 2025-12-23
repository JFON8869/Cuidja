'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc, WithId } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { Product } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { ProductOptionsSheet } from '@/components/product/ProductOptionsSheet';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { firestore } = useFirebase();
  const { addToCart } = useCart();

  const [isAddedSheetOpen, setIsAddedSheetOpen] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(
    null
  );

  const productRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'products', id);
  }, [firestore, id]);

  const {
    data: product,
    isLoading: isLoadingProduct,
    error,
  } = useDoc<WithId<Product>>(productRef);

  const storeRef = useMemoFirebase(() => {
    if (!firestore || !product?.storeId) return null;
    return doc(firestore, 'stores', product.storeId);
  }, [firestore, product?.storeId]);

  const { data: store, isLoading: isLoadingStore } = useDoc(storeRef);

  const isLoading = isLoadingProduct || (product && isLoadingStore);
  const hasOptions = product?.addons && product.addons.length > 0;

  const handleAddToCart = (productToAdd: Product) => {
    if (!hasOptions) {
      addToCart(productToAdd);
    }
    setLastAddedProduct(productToAdd);
    setIsAddedSheetOpen(true);
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Produto não encontrado</h2>
        <p className="text-muted-foreground">
          O produto que você está procurando não existe ou foi removido.
        </p>
        <Button asChild variant="link" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }
  
  if (product.type === 'SERVICE') {
    router.replace(`/checkout-servico?serviceId=${product.id}&storeId=${product.storeId}`);
    return <ProductDetailSkeleton />;
  }

  return (
    <Sheet open={isAddedSheetOpen} onOpenChange={setIsAddedSheetOpen}>
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="absolute left-0 top-0 z-10 flex w-full items-center p-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6 text-white drop-shadow-md" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <section className="relative -mb-4 h-80 w-full">
            <Carousel className="h-full w-full">
              <CarouselContent>
                {product.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={image.imageUrl}
                      alt={`${product.name} - imagem ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {product.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
             <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
          </section>

          <section className="space-y-4 rounded-t-2xl bg-background p-4">
            <h1 className="font-headline text-3xl">{product.name}</h1>
            <p className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(product.price)}
            </p>
            {store && (
              <Link
                href={`/lojas/${store.id}`}
                className="inline-block"
              >
                <Card className="hover:bg-muted/50">
                    <CardContent className="flex items-center gap-3 p-3">
                        <Image src={store.logoUrl || 'https://picsum.photos/seed/storelogo/40'} alt={`Logo da ${store.name}`} width={40} height={40} className="rounded-md"/>
                        <div>
                            <p className="font-semibold">{store.name}</p>
                            <p className="text-sm text-muted-foreground">Ver loja</p>
                        </div>
                    </CardContent>
                </Card>
              </Link>
            )}
            {product.description && (
                <div>
                    <h2 className="font-headline text-xl mb-2">Sobre o produto</h2>
                    <p className="text-muted-foreground">{product.description}</p>
                </div>
            )}
          </section>
        </main>

        <footer className="border-t bg-card p-4">
          {hasOptions ? (
            <ProductOptionsSheet product={product} onAddToCart={handleAddToCart}>
              <Button size="lg" className="w-full">
                <ShoppingCart className="mr-2" />
                Adicionar ao Carrinho
              </Button>
            </ProductOptionsSheet>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={() => handleAddToCart(product)}
            >
              <ShoppingCart className="mr-2" />
              Adicionar ao Carrinho
            </Button>
          )}
        </footer>
      </div>

       <SheetContent>
            <SheetHeader>
                <SheetTitle>Produto Adicionado!</SheetTitle>
            </SheetHeader>
            <div className="py-4 flex flex-col items-center text-center">
                <Image src={lastAddedProduct?.images[0].imageUrl || ''} alt={lastAddedProduct?.name || ''} width={128} height={128} className="rounded-lg mb-4" />
                <p className="font-semibold mb-6">{lastAddedProduct?.name} foi adicionado ao seu carrinho.</p>
                <div className="w-full space-y-3">
                    <Button asChild size="lg" className="w-full" onClick={() => setIsAddedSheetOpen(false)}>
                        <Link href="/carrinho">Ver Carrinho</Link>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setIsAddedSheetOpen(false)}>
                        Continuar Comprando
                    </Button>
                </div>
            </div>
        </SheetContent>
    </Sheet>
  );
}

const ProductDetailSkeleton = () => (
  <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
    <main className="flex-1">
      <Skeleton className="h-80 w-full" />
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </main>
    <footer className="border-t bg-card p-4">
      <Skeleton className="h-12 w-full" />
    </footer>
  </div>
);
