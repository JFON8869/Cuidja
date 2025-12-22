'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProductContext } from '@/context/ProductContext';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/lib/data';

export default function SearchPage() {
  const { products } = useProductContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Buscar</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar no Cuidja..."
            className="pl-10 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mt-6">
          {searchTerm && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {searchTerm && filteredProducts.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <h3 className="text-lg font-semibold">Nenhum resultado</h3>
              <p className="text-sm">
                Não encontramos produtos para "{searchTerm}".
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
