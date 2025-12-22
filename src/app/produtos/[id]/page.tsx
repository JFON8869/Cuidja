'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useProductContext } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { products } = useProductContext();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center bg-background shadow-2xl">
        <p>Produto não encontrado.</p>
        <Button variant="link" asChild>
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: 'Produto adicionado!',
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-background shadow-2xl">
      <header className="absolute left-0 top-0 z-10 p-2">
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white" asChild>
          <Link href="/">
            <ArrowLeft />
          </Link>
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="aspect-w-1 aspect-h-1">
          <Image
            src={product.image.imageUrl}
            alt={product.name}
            layout="fill"
            className="object-cover"
            data-ai-hint={product.image.imageHint}
          />
        </div>
        <div className="space-y-4 p-4">
          <div>
            <h1 className="text-3xl font-headline">{product.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {product.description || `Descrição detalhada do ${product.name}.`}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            <span>Vendido por {product.seller}</span>
          </div>

          <p className="text-4xl font-bold text-primary">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(product.price)}
          </p>
        </div>
      </main>
      <footer className="border-t bg-card p-4">
        <Button size="lg" className="w-full" onClick={handleAddToCart}>
          Adicionar ao Carrinho
        </Button>
      </footer>
    </div>
  );
}
