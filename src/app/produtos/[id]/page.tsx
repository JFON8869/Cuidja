'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Store, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useProductContext } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ProductOptionsSheet } from '@/components/product/ProductOptionsSheet';
import { Product } from '@/lib/data';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { products } = useProductContext();
  const { cart, addToCart, total } = useCart();
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center bg-transparent shadow-2xl">
        <p>Produto não encontrado.</p>
        <Button variant="link" asChild>
          <Link href="/home">Voltar para o início</Link>
        </Button>
      </div>
    );
  }

  const handleSimpleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartSheetOpen(true);
  };
  
  const handleWithOptionsAddToCart = (product: Product) => {
    // This is called from the options sheet, so we just need to open the cart confirmation
    setIsCartSheetOpen(true);
  }

  const hasOptions = product.addons && product.addons.length > 0;

  return (
    <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="absolute left-0 top-0 z-10 p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
            asChild
          >
            <Link href="/home">
              <ArrowLeft />
            </Link>
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto pb-4">
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square">
                    <Image
                      src={image.imageUrl}
                      alt={`${product.name} - imagem ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {product.images.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4" />
                <CarouselNext className="absolute right-4" />
              </>
            )}
          </Carousel>

          <div className="space-y-4 p-4">
            <div>
              <h1 className="text-3xl font-headline">{product.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {product.description ||
                  `Descrição detalhada do ${product.name}.`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="h-4 w-4" />
              <span>Vendido por {product.seller}</span>
            </div>

            <Separator />

            <Card className="bg-card/80">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Preço</span>
                  <p className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(product.price)}
                  </p>
                </div>
                {hasOptions ? (
                   <ProductOptionsSheet product={product} onAddToCart={handleWithOptionsAddToCart} />
                ) : (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => handleSimpleAddToCart(product)}
                  >
                    Adicionar ao Carrinho
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Produto adicionado!</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
            {cart.slice(-1).map(item => (
                 <div key={item.cartItemId} className="flex items-center gap-4">
                    <Image
                    src={item.images[0].imageUrl}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="rounded-md border object-cover aspect-square"
                    />
                    <div className="flex-1">
                    <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-primary font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        }).format(item.price)}
                    </p>
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <ul className="text-xs text-muted-foreground mt-1">
                            {item.selectedAddons.map(addon => (
                                <li key={addon.name}>+ {addon.name}</li>
                            ))}
                        </ul>
                    )}
                    </div>
              </div>
            ))}
        </div>
        <SheetFooter className="grid grid-cols-1 gap-2 text-center">
            <div className="flex justify-between items-center text-lg p-4 border-t border-b">
                <span className="text-muted-foreground">Total do Carrinho</span>
                <span className="font-bold">
                     {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(total)}
                </span>
            </div>
          <Button size="lg" className="w-full" asChild>
            <Link href="/checkout">Finalizar Compra</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => setIsCartSheetOpen(false)}
          >
            Continuar Comprando
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
