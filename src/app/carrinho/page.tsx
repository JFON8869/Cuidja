'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cart, removeFromCart, total } = useCart();

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
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
              <Link href="/">Começar a comprar</Link>
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <Image
                  src={item.image.imageUrl}
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
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.id)}
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
    </div>
  );
}
