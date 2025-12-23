
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Store } from '@/lib/data';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const storeSchema = z.object({
  name: z.string().min(3, 'O nome da loja é obrigatório.'),
  address: z.string().min(10, 'O endereço é obrigatório.'),
  logoUrl: z.string().url('URL do logo inválida.').optional().or(z.literal('')),
});

type StoreFormValues = z.infer<typeof storeSchema>;

export default function StoreFormPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: '', address: '', logoUrl: '' },
  });

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
        router.push('/login?redirect=/vender');
        return;
    }

    const fetchStore = async () => {
        if (!firestore || !user) return;
        setIsLoading(true);
        const q = query(collection(firestore, 'stores'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const storeDoc = querySnapshot.docs[0];
            const storeData = { id: storeDoc.id, ...storeDoc.data() } as Store;
            setStore(storeData);
            form.reset(storeData);
        }
        setIsLoading(false);
    };
    fetchStore();
  }, [user, firestore, isUserLoading, router, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: StoreFormValues) => {
    if (!user || !firestore) return;

    try {
      if (store) {
        // Update existing store
        const storeRef = doc(firestore, 'stores', store.id);
        await updateDoc(storeRef, values);
        toast.success('Loja atualizada com sucesso!');
      } else {
        // Create new store
        const newStoreRef = doc(collection(firestore, 'stores'));
        const newStore = {
          ...values,
          id: newStoreRef.id,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };
        await setDoc(newStoreRef, newStore);
        toast.success('Sua loja foi criada!');
      }
      router.push('/vender');
      router.refresh(); // Forces a refresh to fetch new store data on the dashboard
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error('Erro ao salvar os dados da loja.');
    }
  };
  
    if (isLoading || isUserLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="flex items-center border-b p-4">
            <Button variant="ghost" size="icon" asChild>
            <Link href="/vender">
                <ArrowLeft />
            </Link>
            </Button>
            <h1 className="mx-auto font-headline text-xl">
                {store ? 'Editar Loja' : 'Criar Sua Loja'}
            </h1>
            <div className="w-10"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>{store ? 'Atualize os dados' : 'Informações da Loja'}</CardTitle>
                    <CardDescription>
                        {store ? 'Mantenha as informações da sua loja sempre atualizadas.' : 'Estes são os dados que seus clientes verão. Capriche!'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nome da Loja</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Cantinho da Vovó" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Rua, número, bairro e cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>URL do Logo (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://exemplo.com/logo.png" {...field} />
                            </FormControl>
                            <FormDescription>Cole o link de uma imagem para ser o logo da sua loja.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {store ? 'Salvar Alterações' : 'Criar Loja e Ir para o Painel'}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
