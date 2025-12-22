'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product/ProductCard';
import { mockCategories } from '@/lib/data';
import { useProductContext } from '@/context/ProductContext';

export default function Home() {
  const { products } = useProductContext();

  const recommendedProducts = products.slice(0, 5);
  const featuredProducts = products.slice(5);

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col overflow-hidden bg-transparent shadow-2xl">
      <header className="flex items-center justify-between border-b p-4">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Image src="/logo.svg" alt="Cuidja Logo" width={32} height={32} />
          <h1 className="font-headline text-2xl tracking-wider">Cuidja</h1>
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notificacoes">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notificações</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="space-y-8 p-4">
          {/* Search Section */}
          <Link href="/buscar" className="relative block">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar no Cuidja..."
              className="pl-10 text-base"
              readOnly
            />
          </Link>

          {/* Categories Section */}
          <section>
            <h2 className="mb-3 font-headline text-xl">Categorias</h2>
            <div className="grid grid-cols-4 gap-4">
              {mockCategories.map((category) => (
                <Link
                  href={`/categorias/${category.slug}`}
                  key={category.id}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-card text-primary shadow-sm">
                    <category.Icon className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-medium leading-tight text-muted-foreground">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Personalized Recommendations Section */}
          <section>
            <h2 className="mb-1 font-headline text-xl">Para você</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Recomendações com base na sua atividade.
            </p>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 hide-scrollbar">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="w-40 shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          {/* Featured Products Section */}
          <section>
            <h2 className="mb-3 font-headline text-xl">Destaques</h2>
            <div className="grid grid-cols-2 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
