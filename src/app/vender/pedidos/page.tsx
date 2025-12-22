'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductOrdersList } from '@/components/vender/ProductOrdersList';
import { ServiceOrdersList } from '@/components/vender/ServiceOrdersList';

export default function SellerOrdersPage() {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Minhas Vendas</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <Tabs defaultValue="products" className="flex h-full flex-col">
          <TabsList className="m-4 grid w-auto grid-cols-2 self-center">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="flex-1">
            <ProductOrdersList />
          </TabsContent>
          <TabsContent value="services" className="flex-1">
            <ServiceOrdersList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
