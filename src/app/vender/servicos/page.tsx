'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Wrench,
  PlusCircle,
  MoreVertical,
  Loader2,
  Trash2,
  Edit,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { useFirebase } from '@/firebase';
import { Product } from '@/lib/data';
import { WithId } from '@/firebase/firestore/use-collection';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog"

export default function SellerServicesPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [services, setServices] = useState<WithId<Product>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading || !firestore || !user) {
        if(!isUserLoading) setIsLoading(false);
        return;
    }

    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const storesQuery = query(collection(firestore, 'stores'), where('userId', '==', user.uid));
        const storesSnapshot = await getDocs(storesQuery);
        
        if (storesSnapshot.empty) {
            toast.error("Você precisa criar uma loja primeiro.");
            setServices([]);
            setIsLoading(false);
            return;
        }

        const currentStoreId = storesSnapshot.docs[0].id;
        setStoreId(currentStoreId);

        const servicesQuery = query(
          collection(firestore, 'products'),
          where('storeId', '==', currentStoreId),
          where('type', '==', 'SERVICE')
        );

        const servicesSnapshot = await getDocs(servicesQuery);
        const fetchedServices = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<Product>));
        setServices(fetchedServices);

      } catch (error) {
        console.error("Error fetching seller services:", error);
        toast.error("Não foi possível carregar seus serviços.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [user, firestore, isUserLoading]);

  const handleDelete = async (serviceId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'products', serviceId);
    try {
        await deleteDoc(docRef);
        setServices(prev => prev.filter(p => p.id !== serviceId));
        toast.success("Serviço excluído com sucesso.");
    } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Erro ao excluir o serviço. Verifique suas permissões.");
    }
  }


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
          <Link href={`/vender/novo-servico?storeId=${storeId}`}>
            <PlusCircle />
          </Link>
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center p-4 text-center">
             <Wrench className="w-16 h-16 text-muted-foreground mb-4"/>
            <h2 className="text-2xl font-bold">Nenhum serviço cadastrado</h2>
            <p className="text-muted-foreground mb-4">
              Clique no botão '+' para oferecer seu primeiro serviço.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {services.map(service => (
                 <div key={service.id} className="p-4 flex items-center gap-4">
                    {service.images && service.images.length > 0 ? (
                        <Image 
                            src={service.images[0]?.imageUrl || 'https://picsum.photos/seed/placeholder/100'}
                            alt={service.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover w-16 h-16 border"
                        />
                     ) : (
                        <div className="h-16 w-16 flex items-center justify-center rounded-md border bg-muted">
                           <Wrench className="h-8 w-8 text-muted-foreground"/>
                       </div>
                    )}
                    <div className="flex-1">
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-primary font-bold">
                           {service.price > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price) : "A combinar"}
                        </p>
                    </div>
                     <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                    <Link href={`/vender/servicos/editar/${service.id}`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Link>
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o serviço "{service.name}" dos seus anúncios.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDelete(service.id)}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Sim, excluir serviço
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
