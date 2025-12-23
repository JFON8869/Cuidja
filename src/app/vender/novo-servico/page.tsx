'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CreateStorePrompt } from '@/components/vender/CreateStorePrompt';

const serviceSchema = z.object({
  name: z.string().min(3, 'O nome do serviço é obrigatório.'),
  description: z.string().min(10, "A descrição é obrigatória.").optional(),
  price: z.coerce.number().min(0, 'O preço deve ser 0 (a combinar) ou maior.'),
  attendanceType: z.enum(['presencial', 'online', 'ambos'], { required_error: "Selecione o tipo de atendimento."}),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

function NewServicePage() {
  const { user, firestore, isUserLoading, store, isStoreLoading } = useFirebase();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/vender');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || isStoreLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!store) {
    return <CreateStorePrompt />;
  }

  async function onSubmit(values: ServiceFormValues) {
    if (!firestore || !user || !store) {
      toast.error('Erro de autenticação ou loja não encontrada. Faça login novamente.');
      return;
    }
    
    setIsSubmitting(true);
    try {
        // Services have a generic placeholder image by default
        const serviceImage = {
            imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxzZXJ2aWNlfGVufDB8fHx8MTc3MzM5NzAyNHww&ixlib=rb-4.1.0&q=80&w=1080',
            imageHint: 'professional service'
        }

        await addDoc(collection(firestore, 'products'), {
            ...values,
            storeId: store.id,
            sellerId: user.uid,
            type: 'SERVICE',
            category: 'Serviços', // Legacy category for services
            availability: 'on_demand', // Services are always on demand
            images: [serviceImage],
            createdAt: serverTimestamp(),
        });

        toast.success('Serviço publicado com sucesso!');
        router.push('/vender/servicos');
    } catch (error) {
        console.error('Error saving service:', error);
        toast.error('Não foi possível salvar o serviço. Tente novamente.');
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender/novo-anuncio">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Novo Serviço</h1>
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
                    <Textarea placeholder="Descreva o que você faz, sua experiência e o que está incluso." {...field} rows={5} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Publicando serviço...' : 'Publicar Serviço'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}


export default function NewServicePageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>}>
            <NewServicePage />
        </Suspense>
    )
}
