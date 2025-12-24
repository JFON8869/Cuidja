'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirebase } from '@/firebase';
import { Product } from '@/lib/data';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import BottomNav from '@/components/layout/BottomNav';

const serviceSchema = z.object({
  name: z.string().min(3, 'O nome do serviço é obrigatório.'),
  description: z.string().min(10, 'A descrição é obrigatória.').optional(),
  price: z.coerce.number().min(0, 'O preço deve ser 0 (a combinar) ou maior.'),
  attendanceType: z.enum(['presencial', 'online', 'ambos'], {
    required_error: 'Selecione o tipo de atendimento.',
  }),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  serviceId?: string;
}

export function ServiceForm({ serviceId }: ServiceFormProps) {
  const { user, firestore, auth, isUserLoading, store, isStoreLoading } =
    useFirebase();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(!!serviceId);

  const isEditing = !!serviceId;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
    },
  });

  useEffect(() => {
    if (isUserLoading || isStoreLoading) return;
    if (!user) {
      router.push('/login?redirect=/vender');
    } else if (!store) {
      router.push('/vender/loja');
    }
  }, [isUserLoading, user, isStoreLoading, store, router]);

  useEffect(() => {
    if (isEditing && firestore && serviceId) {
      const fetchService = async () => {
        setIsPageLoading(true);
        const docRef = doc(firestore, 'products', serviceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          form.reset(docSnap.data() as Product);
        } else {
          toast.error('Serviço não encontrado.');
          router.push('/vender/servicos');
        }
        setIsPageLoading(false);
      };
      fetchService();
    }
  }, [firestore, serviceId, form, router, isEditing]);

  async function onSubmit(values: ServiceFormValues) {
    if (!firestore || !auth?.currentUser || !store) {
      toast.error('É necessário estar autenticado e ter uma loja para criar um anúncio.');
      return;
    }

    const uid = auth.currentUser.uid;
     if (!uid) {
        toast.error('Não foi possível verificar sua identidade. Faça login novamente.');
        return;
    }

    setIsSubmitting(true);
    
    try {
      const dataToSave = {
        ...values,
        description: values.description || '',
        price: Number(values.price),
        storeId: store.id,
        sellerId: uid,
        type: 'SERVICE' as const,
        category: 'Serviços',
        availability: 'on_demand' as const,
      };

      if (isEditing && serviceId) {
        const docRef = doc(firestore, 'products', serviceId);
        await updateDoc(docRef, { ...dataToSave, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(firestore, 'products'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
      }

      // Atomically add the "Serviços" category to the store's list of categories
      const storeRef = doc(firestore, 'stores', store.id);
      await updateDoc(storeRef, {
          categories: arrayUnion('Serviços')
      });
      
      toast.success(isEditing ? 'Serviço atualizado com sucesso!' : 'Serviço publicado com sucesso!');
      router.push('/vender/servicos');
      router.refresh();

    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Não foi possível salvar o serviço. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isUserLoading || isStoreLoading || isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={isEditing ? '/vender/servicos' : '/vender/novo-anuncio'}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aula de Violão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Serviço</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que você faz, sua experiência e o que está incluso."
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Deixe 0 para "A combinar".</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attendanceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Atendimento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing
                ? 'Salvar Alterações'
                : 'Publicar Serviço'}
            </Button>
          </form>
        </Form>
      </main>
      <BottomNav />
    </div>
  );
}
