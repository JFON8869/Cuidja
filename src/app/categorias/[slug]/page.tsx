'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductContext } from '@/context/ProductContext';
import { mockCategories } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;
  const { products } = useProductContext();

  const category = mockCategories.find((cat) => cat.slug === slug);
  const categoryProducts = products.filter(
    (product) => product.category === category?.name
  );

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          {category?.name || 'Categoria'}
        </h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Nenhum produto encontrado</h2>
            <p className="text-muted-foreground">
              Não há produtos nesta categoria no momento.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
