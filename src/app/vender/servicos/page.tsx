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
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
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
} from "@/components/ui/alert-dialog"
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/layout/BottomNav';

export default function SellerServicesPage() {
  const { user, firestore, isUserLoading, store, isStoreLoading } = useFirebase();
  const [services, setServices] = useState<WithId<Product>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || isStoreLoading) {
      return;
    }
    if (!user || !store) {
      setIsLoading(false);
      return;
    }

    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const servicesQuery = query(
          collection(firestore, 'products'),
          where('storeId', '==', store.id),
          where('type', '==', 'SERVICE')
        );

        const servicesSnapshot = await getDocs(servicesQuery);
        let fetchedServices = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<Product>));
        
        // Sort on the client-side
        fetchedServices.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });

        setServices(fetchedServices);

      } catch (error) {
        console.error("Error fetching seller services:", error);
        toast.error("Não foi possível carregar seus serviços.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [user, firestore, isUserLoading, store, isStoreLoading]);

  const handleAvailabilityChange = async (service: WithId<Product>, isChecked: boolean) => {
    if (!firestore) return;
    
    // Services use 'on_demand' or 'unavailable'.
    const newAvailability = isChecked ? 'on_demand' : 'unavailable';

    // Optimistic UI update
    setServices(prevServices => 
      prevServices.map(s => s.id === service.id ? { ...s, availability: newAvailability } : s)
    );

    try {
      const serviceRef = doc(firestore, 'products', service.id);
      await updateDoc(serviceRef, {
        availability: newAvailability
      });
      toast.success(`Status de "${service.name}" atualizado.`);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error(`Falha ao atualizar o status de "${service.name}". Revertendo.`);
      // Revert optimistic update
      setServices(prevServices => 
        prevServices.map(s => s.id === service.id ? { ...s, availability: service.availability } : s)
      );
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'products', serviceId);
    try {
        await deleteDoc(docRef);
        setServices(prev => prev.filter(p => p.id !== serviceId));
        toast.success("Serviço excluído com sucesso.");
    } catch (error) {
        console.error("Error deleting service:", error);
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);

        toast.error("Erro ao excluir o serviço. Verifique suas permissões.");
    }
  }


  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Meus Serviços</h1>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/vender/novo-anuncio`}>
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
                 <div key={service.id} className={cn("p-4 flex items-center gap-4 transition-opacity", service.availability === 'unavailable' && 'opacity-50')}>
                    <div className="h-16 w-16 flex items-center justify-center rounded-md border bg-muted">
                        <Wrench className="h-8 w-8 text-muted-foreground"/>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-primary font-bold">
                           {service.price > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price) : "A combinar"}
                        </p>
                    </div>
                     <Switch
                        checked={service.availability !== 'unavailable'}
                        onCheckedChange={(isChecked) => handleAvailabilityChange(service, isChecked)}
                        aria-label={`Disponibilidade de ${service.name}`}
                     />
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
      <BottomNav/>
    </div>
  );
}
