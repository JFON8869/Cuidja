
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Search, Loader2 } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product/ProductCard';
import { mockCategories, mockBanners } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { WithId } from '@/firebase/firestore/use-collection';
import { Product } from '@/lib/data';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';

export default function Home() {
  const [products, setProducts] = React.useState<WithId<Product>[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { firestore } = useFirebase();

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    async function fetchProducts() {
      if (!firestore) return;
      setIsLoading(true);
      try {
        const productsQuery = query(collection(firestore, 'products'), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(productsQuery);
        const fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as WithId<Product>[];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [firestore]);

  const recommendedProducts = React.useMemo(() => {
    if (products.length === 0) return [];
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }, [products]);

  const featuredProducts = products.slice(5, 15);

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col overflow-hidden bg-transparent shadow-2xl">
      <header className="flex items-center justify-between border-b p-4">
        <Link href="/home" className="flex items-center gap-2 text-primary">
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
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-xl border bg-card shadow-sm',
                      'bg-green-500'
                    )}
                  >
                    <category.Icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-xs font-medium leading-tight text-muted-foreground">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Banner Carousel Section */}
          <section>
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {mockBanners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <Link href={banner.link}>
                      <Card className="overflow-hidden">
                        <CardContent className="relative aspect-[21/9] p-0">
                          <Image
                            src={banner.image.imageUrl}
                            alt={banner.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={banner.image.imageHint}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
                          <div className="absolute bottom-0 left-0 p-4 text-white">
                            <h3 className="font-headline text-xl">
                              {banner.title}
                            </h3>
                            <p className="text-sm">{banner.subtitle}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>

          {isLoading ? <Loader2 className="animate-spin mx-auto my-8" /> : 
          <>
            {/* Personalized Recommendations Section */}
            <section>
              <h2 className="mb-1 font-headline text-xl">Para você</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Recomendações com base na sua atividade.
              </p>
              <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
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
          </>
          }
        </div>
      </main>
    </div>
  );
}
