
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useProductContext } from '@/context/ProductContext';
import { mockStores, mockServices } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { products } = useProductContext();

  const store = mockStores.find((s) => s.id === id);
  const storeProducts = products.filter((product) => product.storeId === id);
  const storeServices = mockServices.filter((service) => service.providerId === id);

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

  const isServiceStore = store.category === 'Serviços';

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
        {isServiceStore ? (
             <div className="space-y-4">
                <p className="text-center text-muted-foreground">Serviços oferecidos por {store.name}. Entre em contato para solicitar um orçamento.</p>
                {storeServices.map((service) => (
                    <Card key={service.id} className="overflow-hidden">
                        <Image src={service.images[0].imageUrl} alt={service.name} width={400} height={200} className="w-full h-32 object-cover" />
                        <CardHeader>
                            <CardTitle>{service.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{service.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Solicitar Orçamento
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
             </div>
        ) : storeProducts.length > 0 ? (
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

