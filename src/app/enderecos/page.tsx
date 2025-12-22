'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  PlusCircle,
  Home,
  Trash2,
  MapPin,
  Loader2,
} from 'lucide-react';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const addressSchema = z.object({
  nickname: z.string().min(2, 'O apelido é obrigatório.'),
  zip: z.string().min(8, 'CEP inválido.').max(9, 'CEP inválido.'),
  street: z.string().min(3, 'A rua é obrigatória.'),
  number: z.string().min(1, 'O número é obrigatório.'),
  neighborhood: z.string().min(2, 'O bairro é obrigatório.'),
  city: z.string().min(2, 'A cidade é obrigatória.'),
});

type Address = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchAddresses() {
      if (!user || !firestore) {
        if (!isUserLoading) setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setAddresses(userDoc.data().addresses || []);
      }
      setIsLoading(false);
    }
    fetchAddresses();
  }, [user, firestore, isUserLoading]);

  const form = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      nickname: '',
      zip: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
    },
  });

  const handleAddAddress = async (values: Address) => {
    if (!user || !firestore) return;
    setIsSubmitting(true);
    const userDocRef = doc(firestore, 'users', user.uid);

    try {
      await updateDoc(userDocRef, {
        addresses: arrayUnion(values),
      });
      setAddresses((prev) => [...prev, values]);
      toast({ title: 'Endereço adicionado com sucesso!' });
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar endereço.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressToDelete: Address) => {
    if (!user || !firestore) return;
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        addresses: arrayRemove(addressToDelete),
      });
      setAddresses((prev) =>
        prev.filter(
          (addr) => JSON.stringify(addr) !== JSON.stringify(addressToDelete)
        )
      );
      toast({ title: 'Endereço removido.' });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao remover endereço.',
      });
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="flex items-center border-b p-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/perfil">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="mx-auto font-headline text-xl">Endereços Salvos</h1>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusCircle />
            </Button>
          </DialogTrigger>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            renderSkeleton()
          ) : addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((addr, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg border bg-card p-4"
                >
                  <Home className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                  <div className="flex-1">
                    <p className="font-bold">{addr.nickname}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.street}, {addr.number} - {addr.neighborhood}, {addr.city} - CEP: {addr.zip}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAddress(addr)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MapPin className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-bold">
                Nenhum endereço salvo
              </h2>
              <p className="mb-4 text-muted-foreground">
                Adicione endereços para facilitar suas próximas compras.
              </p>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2" />
                  Adicionar Novo Endereço
                </Button>
              </DialogTrigger>
            </div>
          )}
        </main>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Endereço</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddAddress)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apelido (Ex: Casa, Trabalho)</FormLabel>
                  <FormControl>
                    <Input placeholder="Casa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input placeholder="00000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua das Flores" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Centro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Sua cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Endereço
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
