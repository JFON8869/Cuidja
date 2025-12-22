
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MessageSquare, Briefcase, Loader2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useProductContext } from '@/context/ProductContext';
import { mockStores, Service } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';

// Add WithId to the Service type for Firestore documents
type ServiceWithId = WithId<Service>;

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { products } = useProductContext();
  const { firestore } = useFirebase();

  const [store, setStore] = React.useState<WithId<DocumentData> | null>(null);
  const [isLoadingStore, setIsLoadingStore] = React.useState(true);
  
  // Find static store info first to get category, name etc.
  const staticStoreInfo = mockStores.find((s) => s.id === id);

  React.useEffect(() => {
    async function fetchStoreDoc() {
      if (!firestore || !id) {
        setIsLoadingStore(false);
        return;
      }
      // This is a workaround. In a real app, you might fetch this doc by its known ID.
      // Here, we query based on a field we know from mock data. This assumes store names are unique.
      const storeQuery = query(collection(firestore, 'stores'), where('name', '==', staticStoreInfo?.name));
      const querySnapshot = await getDocs(storeQuery);

      if (!querySnapshot.empty) {
        const storeDoc = querySnapshot.docs[0];
        setStore({ id: storeDoc.id, ...storeDoc.data() });
      } else {
        // Fallback for stores that might not be in Firestore yet in this mock setup
        // This part is tricky because the page needs an ID to fetch services.
        // We'll use the mock ID as a fallback, but this highlights a data structure dependency.
      }
      setIsLoadingStore(false);
    }

    if (staticStoreInfo) {
      fetchStoreDoc();
    } else {
      setIsLoadingStore(false);
    }
  }, [firestore, id, staticStoreInfo]);


  // Fetch services from Firestore using the actual Firestore document ID of the store
  const servicesQuery = useMemoFirebase(() => {
    if (!firestore || !store?.id) return null;
    return query(
        collection(firestore, 'services'),
        where('providerId', '==', store.id)
    );
  }, [firestore, store]);

  const { data: storeServices, isLoading: areServicesLoading } = useCollection<ServiceWithId>(servicesQuery);

  const storeProducts = products.filter((product) => product.storeId === id);

  if (!staticStoreInfo && !isLoadingStore) {
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
  
  if (isLoadingStore) {
      return (
         <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
            <header className="flex items-center border-b p-4">
                 <Loader2 className="h-8 w-8 animate-spin" />
            </header>
        </div>
      )
  }

  const isServiceStore = staticStoreInfo?.category === 'Serviços';

  const getServiceButton = (service: ServiceWithId) => {
    const hasFee = service.visitFee && service.visitFee > 0;
    const feeString = hasFee ? ` por ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.visitFee!)}` : '';
    const buttonText = hasFee ? `Contratar Visita${feeString}` : 'Entrar em Contato';
    const buttonIcon = hasFee ? <Briefcase className="mr-2 h-4 w-4" /> : <MessageSquare className="mr-2 h-4 w-4" />;
    
    // Pass the firestore doc ID of the service and the store
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
            <AvatarImage src={staticStoreInfo?.logo.imageUrl} alt={staticStoreInfo?.name} />
            <AvatarFallback>{staticStoreInfo?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h1 className="font-headline text-xl">{staticStoreInfo?.name}</h1>
        </div>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {isServiceStore ? (
             <div className="space-y-4">
                <p className="text-center text-muted-foreground">Serviços oferecidos por {staticStoreInfo?.name}.</p>
                {areServicesLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : storeServices && storeServices.length > 0 ? (
                    storeServices.map((service) => (
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
                    ))
                ) : (
                   <div className="flex h-48 flex-col items-center justify-center text-center">
                        <h2 className="text-2xl font-bold">Nenhum serviço encontrado</h2>
                        <p className="text-muted-foreground">
                        Este prestador ainda não anunciou serviços.
                        </p>
                    </div>
                )}
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
