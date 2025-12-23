
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit, MoreVertical, PlusCircle, Trash, Loader2, Wrench } from 'lucide-react';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Product } from '@/lib/data';


interface Service extends WithId<Product> {}

export default function MyServicesPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'products'),
      where('sellerId', '==', user.uid),
      where('category', '==', 'Serviços')
    );
  }, [firestore, user]);

  const { data: myServices, isLoading: areServicesLoading } = useCollection<Service>(servicesQuery);
  const isLoading = isUserLoading || areServicesLoading;

  const handleDelete = async (serviceId: string, serviceName: string) => {
    if (!firestore) return;
    setIsDeleting(true);
    try {
        await deleteDoc(doc(firestore, "products", serviceId));
        toast.success(`O serviço "${serviceName}" foi removido.`);
        // NOTE: No need to router.push, the page will re-render via useCollection
    } catch(error) {
        console.error("Error deleting service: ", error);
        toast.error(`Não foi possível remover o serviço. Tente novamente.`);
    } finally {
        setIsDeleting(false);
    }
  }
  
  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
        <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8" />
            </CardContent>
        </Card>
    ))
  );

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Meus Serviços</h1>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender/novo-produto">
            <PlusCircle />
          </Link>
        </Button>
      </header>
      <main className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? renderSkeleton() : 
        myServices && myServices.length > 0 ? (
          myServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                <Image
                  src={service.images[0]?.imageUrl || '/placeholder.png'}
                  alt={service.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md border object-cover aspect-square"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-primary">
                    {`Taxa de contato: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}`}
                  </p>
                </div>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/vender/produtos/editar/${service.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                       <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                   <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso excluirá permanentemente o serviço "{service.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeleting}
                        onClick={() => handleDelete(service.id, service.name)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                         {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <Wrench className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Nenhum serviço anunciado</h2>
            <p className="text-muted-foreground mb-4">
              Anuncie seu primeiro serviço para vê-lo aqui.
            </p>
            <Button asChild>
                <Link href="/vender/novo-produto">
                    <PlusCircle className="mr-2" />
                    Anunciar serviço
                </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

    