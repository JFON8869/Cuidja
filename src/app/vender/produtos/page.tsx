
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit, MoreVertical, PlusCircle, Trash, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
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
} from '@/components/ui/alert-dialog';


interface Product extends WithId<any> {
    name: string;
    price: number;
    images: { imageUrl: string }[];
}

export default function MyProductsPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<{id: string, name: string} | null>(null);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'products'),
      where('sellerId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: myProducts, isLoading: areProductsLoading } = useCollection<Product>(productsQuery);
  const isLoading = isUserLoading || areProductsLoading;

  const handleDelete = async () => {
    if (!firestore || !productToDelete) return;
    
    setIsDeleting(true);
    try {
        await deleteDoc(doc(firestore, "products", productToDelete.id));
        toast.success(`O produto "${productToDelete.name}" foi removido.`);
    } catch(error) {
        console.error("Error deleting product: ", error);
        toast.error(`Não foi possível remover o produto. Tente novamente.`);
    } finally {
        setIsDeleting(false);
        setIsAlertOpen(false);
        setProductToDelete(null);
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
                    <Skeleton className="h-3 w-1/4" />
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
        <h1 className="mx-auto font-headline text-xl">Meus Produtos</h1>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender/novo-produto">
            <PlusCircle />
          </Link>
        </Button>
      </header>
      <main className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? renderSkeleton() : 
        myProducts && myProducts.length > 0 ? (
          myProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                <Image
                  src={product.images[0]?.imageUrl || '/placeholder.png'}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md border object-cover aspect-square"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(product.price)}
                  </p>
                  {/* Placeholder for stock */}
                  <p className="text-xs text-muted-foreground">Estoque: --</p>
                </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/vender/produtos/editar/${product.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem 
                        className="text-destructive"
                        onSelect={() => {
                            setProductToDelete({ id: product.id, name: product.name });
                            setIsAlertOpen(true);
                        }}
                       >
                            <Trash className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <h2 className="text-2xl font-bold">Nenhum produto anunciado</h2>
            <p className="text-muted-foreground mb-4">
              Anuncie seu primeiro produto para vê-lo aqui.
            </p>
            <Button asChild>
                <Link href="/vender/novo-produto">
                    <PlusCircle className="mr-2" />
                    Anunciar produto
                </Link>
            </Button>
          </div>
        )}
      </main>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o produto "{productToDelete?.name}".
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
            disabled={isDeleting}
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
            >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Excluir
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
