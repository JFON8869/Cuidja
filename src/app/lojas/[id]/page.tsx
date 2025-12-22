
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageSquare, Briefcase, Loader2, Package, Wrench } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { type Service, type Product } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, DocumentData } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Separator } from '@/components/ui/separator';

type ServiceWithId = WithId<Service>;
type ProductWithId = WithId<Product>;

interface StoreDocument {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
  userId: string;
}

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { firestore } = useFirebase();
  
  const storeRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'stores', id);
  }, [firestore, id]);

  const { data: store, isLoading: isLoadingStore } = useDoc<StoreDocument>(storeRef);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !store?.id) return null;
    return query(
        collection(firestore, 'products'),
        where('storeId', '==', store.id)
    );
  }, [firestore, store]);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore || !store?.id) return null;
    return query(
        collection(firestore, 'services'),
        where('providerId', '==', store.id)
    );
  }, [firestore, store]);

  const { data: storeProducts, isLoading: areProductsLoading } = useCollection<ProductWithId>(productsQuery);
  const { data: storeServices, isLoading: areServicesLoading } = useCollection<ServiceWithId>(servicesQuery);

  const isLoading = isLoadingStore || areProductsLoading || areServicesLoading;

  if (!store && !isLoadingStore) {
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
  
  if (isLoading) {
      return (
         <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
            <header className="flex items-center border-b p-4">
                 <Loader2 className="h-8 w-8 animate-spin" />
            </header>
        </div>
      )
  }

  const hasProducts = storeProducts && storeProducts.length > 0;
  const hasServices = storeServices && storeServices.length > 0;

  const getServiceButton = (service: ServiceWithId) => {
    const hasFee = service.visitFee && service.visitFee > 0;
    const feeString = hasFee ? ` por ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.visitFee!)}` : '';
    const buttonText = hasFee ? `Contratar Visita${feeString}` : 'Entrar em Contato';
    const buttonIcon = hasFee ? <Briefcase className="mr-2 h-4 w-4" /> : <MessageSquare className="mr-2 h-4 w-4" />;
    
    const href = `/checkout-servico?serviceId=${service.id}&storeId=${store?.id}`;

    return (
      <Button asChild className="w-full">
        <Link href={href}>
          {buttonIcon}
          {buttonText}
        </Link>
      </Button>
    );
  };

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="mx-auto flex items-center gap-3">
          <Avatar>
            <AvatarImage src={store?.logoUrl} alt={store?.name} />
            <AvatarFallback>{store?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h1 className="font-headline text-xl">{store?.name}</h1>
        </div>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {hasProducts && (
            <section>
                <h2 className="text-2xl font-headline mb-4 flex items-center gap-2">
                    <Package className="h-6 w-6" />
                    Produtos
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {storeProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        )}

        {hasServices && (
             <section>
                <h2 className="text-2xl font-headline mb-4 flex items-center gap-2">
                    <Wrench className="h-6 w-6" />
                    Serviços
                </h2>
                <div className="space-y-4">
                    {storeServices.map((service) => (
                        <Card key={service.id} className="overflow-hidden">
                            <Image src={service.images[0].imageUrl} alt={service.name} width={400} height={200} className="w-full h-32 object-cover" />
                            <CardHeader>
                                <CardTitle>{service.name}</CardTitle>
                                {service.visitFee && service.visitFee > 0 && (
                                    <CardDescription className="text-lg font-bold text-primary pt-1">
                                        Taxa de visita: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.visitFee)}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{service.description}</CardDescription>
                            </CardContent>
                            <CardFooter>
                               {getServiceButton(service)}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>
        )}
        
        {!hasProducts && !hasServices && (
           <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">Nenhum item encontrado</h2>
            <p className="text-muted-foreground">
              Esta loja ainda não tem produtos ou serviços cadastrados.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
