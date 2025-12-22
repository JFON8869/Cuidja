'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useProductContext } from '@/context/ProductContext';
import { mockStores } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { products } = useProductContext();

  const store = mockStores.find((s) => s.id === id);
  const storeProducts = products.filter((product) => product.storeId === id);

  if (!store) {
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

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="mx-auto flex items-center gap-3">
          <Avatar>
            <AvatarImage src={store.logo.imageUrl} alt={store.name} />
            <AvatarFallback>{store.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h1 className="font-headline text-xl">{store.name}</h1>
        </div>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {storeProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {storeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Nenhum produto encontrado</h2>
            <p className="text-muted-foreground">
              Esta loja ainda não tem produtos cadastrados.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
