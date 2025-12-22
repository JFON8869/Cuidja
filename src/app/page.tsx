import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Heart,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/ProductCard";
import { mockCategories, mockProducts } from "@/lib/data";

export default function Home() {
  const recommendedProducts = mockProducts.slice(0, 5);
  const featuredProducts = mockProducts.slice(5);

  return (
    <div className="relative bg-background max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Image src="/logo.svg" alt="Cuidja Logo" width={32} height={32} />
          <h1 className="text-2xl font-headline tracking-wider">Cuidja</h1>
        </Link>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" asChild>
            <Link href="/notificacoes">
              <Bell className="w-5 h-5" />
              <span className="sr-only">Notificações</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-8">
          {/* Search Section */}
          <Link href="/buscar" className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar no Cuidja..."
              className="pl-10 text-base"
              readOnly
            />
          </Link>

          {/* Categories Section */}
          <section>
            <h2 className="text-xl font-headline mb-3">Categorias</h2>
            <div className="grid grid-cols-4 gap-4">
              {mockCategories.map((category) => (
                <Link
                  href="/categorias"
                  key={category.id}
                  className="flex flex-col items-center gap-2 flex-shrink-0 text-center"
                >
                  <div className="w-16 h-16 bg-card rounded-xl flex items-center justify-center border shadow-sm">
                    <Image
                      src={category.iconUrl}
                      alt={category.name}
                      width={32}
                      height={32}
                      data-ai-hint={category.hint}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground leading-tight">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Personalized Recommendations Section */}
          <section>
            <h2 className="text-xl font-headline mb-1">Para você</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Recomendações com base na sua atividade.
            </p>
            <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="w-40 flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          {/* Featured Products Section */}
          <section>
            <h2 className="text-xl font-headline mb-3">Destaques</h2>
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
