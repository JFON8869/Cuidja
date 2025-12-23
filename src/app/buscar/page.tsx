'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/lib/data';
import { useFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startAt,
  endAt,
} from 'firebase/firestore';
import { useDebounce } from 'use-debounce';
import { WithId } from '@/firebase/firestore/use-collection';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<WithId<Product>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { firestore } = useFirebase();

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!firestore || !searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    const normalizedQuery = searchQuery.trim().toLowerCase();
    setIsLoading(true);
    setHasSearched(true);
    try {
      const productsRef = collection(firestore, 'products');
      
      // Since Firestore doesn't support case-insensitive `contains` search natively,
      // we perform a range query on a pre-normalized field or fetch and filter client-side.
      // Assuming no pre-normalized field, we'll fetch a broader range and filter.
      // We also filter by type to only show products.
      const q = query(
        productsRef,
        where('type', '==', 'PRODUCT'),
        orderBy('name')
        // We can't do a perfect "contains" search, but we can do "starts with"
        // startAt(normalizedQuery),
        // endAt(normalizedQuery + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);
      const fetchedProducts: WithId<Product>[] = [];
      querySnapshot.forEach((doc) => {
        const productData = doc.data() as Product;
        // Client-side filtering for "contains"
        if (productData.name.toLowerCase().includes(normalizedQuery)) {
          fetchedProducts.push({ id: doc.id, ...productData });
        }
      });
      setResults(fetchedProducts);
    } catch (error) {
      console.error('Error searching products:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [firestore]);


  useEffect(() => {
    searchProducts(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchProducts]);

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
          {isLoading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
             </div>
          ) : hasSearched && results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <h3 className="text-lg font-semibold">Nenhum resultado</h3>
              <p className="text-sm">
                Não encontramos produtos para "{debouncedSearchTerm}".
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
