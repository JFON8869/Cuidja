'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
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
  orderBy,
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
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/layout/BottomNav';

export default function SellerProductsPage() {
  const { user, firestore, isUserLoading, store, isStoreLoading } =
    useFirebase();
  const [products, setProducts] = useState<WithId<Product>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || isStoreLoading) {
      return;
    }

    if (!user || !store) {
      setIsLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsQuery = query(
          collection(firestore, 'products'),
          where('storeId', '==', store.id),
          where('type', '==', 'PRODUCT'),
          orderBy('createdAt', 'desc')
        );

        const productsSnapshot = await getDocs(productsQuery);
        const fetchedProducts = productsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as WithId<Product>)
        );
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching seller products:', error);
        toast.error('Não foi possível carregar seus produtos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [user, firestore, isUserLoading, store, isStoreLoading]);
  
  const handleAvailabilityChange = async (product: WithId<Product>, isChecked: boolean) => {
    if (!firestore) return;
    
    const newAvailability = isChecked ? 'available' : 'unavailable';

    // Optimistic UI update
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === product.id ? { ...p, availability: newAvailability } : p)
    );

    try {
      const productRef = doc(firestore, 'products', product.id);
      await updateDoc(productRef, {
        availability: newAvailability
      });
      toast.success(`Status de "${product.name}" atualizado.`);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error(`Falha ao atualizar o status de "${product.name}". Revertendo.`);
      // Revert optimistic update
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === product.id ? { ...p, availability: product.availability } : p)
      );
    }
  };

  const handleDelete = async (productId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'products', productId);
    try {
      await deleteDoc(docRef);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success('Produto excluído com sucesso.');
    } catch (error) {
      console.error('Error deleting product:', error);
      // Emit a detailed, structured error for better debugging
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);

      // Also show a generic toast to the user
      toast.error('Erro ao excluir o produto. Verifique suas permissões.');
    }
  };

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Meus Produtos</h1>
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
        ) : products.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Nenhum produto cadastrado</h2>
            <p className="mb-4 text-muted-foreground">
              Clique no botão '+' para adicionar seu primeiro produto.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {products.map((product) => (
              <div key={product.id} className={cn("p-4 flex items-center gap-4 transition-opacity", product.availability === 'unavailable' && 'opacity-50')}>
                <div className="h-16 w-16 flex items-center justify-center rounded-md border bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(product.price)}
                  </p>
                </div>
                 <Switch
                    checked={product.availability === 'available'}
                    onCheckedChange={(isChecked) => handleAvailabilityChange(product, isChecked)}
                    aria-label={`Disponibilidade de ${product.name}`}
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
                        <Link href={`/vender/produtos/editar/${product.id}`}>
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
                        Esta ação não pode ser desfeita. Isso excluirá
                        permanentemente o produto "{product.name}" dos seus
                        anúncios.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(product.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Sim, excluir produto
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
