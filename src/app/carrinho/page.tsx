
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trash2, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Separator } from '@/components/ui/separator';
import BottomNav from '@/components/layout/BottomNav';

export default function CartPage() {
  const { cart, removeFromCart, total, isCartLoading } = useCart();

  const calculateItemTotal = (item: any) => {
    const addonsTotal = item.selectedAddons?.reduce((acc: any, addon: any) => acc + (addon.price * addon.quantity), 0) || 0;
    return (item.price * item.quantity) + addonsTotal;
  }

  if (isCartLoading) {
    return (
       <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center bg-transparent pb-16 shadow-2xl">
         <header className="flex w-full items-center border-b p-4">
           <Button variant="ghost" size="icon" asChild>
             <Link href="/home">
               <ArrowLeft />
             </Link>
           </Button>
           <h1 className="mx-auto font-headline text-xl">Carrinho de Compras</h1>
           <div className="w-10"></div>
         </header>
         <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
         </div>
          <BottomNav />
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Carrinho de Compras</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center h-full">
            <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
            <p className="text-muted-foreground mb-4">
              Adicione produtos para vê-los aqui.
            </p>
            <Button asChild>
              <Link href="/home">Começar a comprar</Link>
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {cart.map((item) => (
              <div key={item.cartItemId} className="flex items-start gap-4">
                {item.images && item.images.length > 0 ? (
                    <Image
                    src={item.images[0].imageUrl}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="rounded-md border object-cover aspect-square"
                    />
                ) : (
                    <div className="h-16 w-16 flex items-center justify-center rounded-md border bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground"/>
                    </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                   {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <ul className="text-xs text-muted-foreground mt-1">
                        {item.selectedAddons.map(addon => (
                            <li key={addon.name}>+ {addon.quantity}x {addon.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(addon.price)})</li>
                        ))}
                    </ul>
                   )}
                  <p className="text-sm text-primary font-bold mt-1">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(calculateItemTotal(item))}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.cartItemId!)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
      {cart.length > 0 && (
         <footer className="border-t bg-card p-4 space-y-4">
            <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">Total</span>
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
        </footer>
      )}
      <BottomNav />
    </div>
  );
}
