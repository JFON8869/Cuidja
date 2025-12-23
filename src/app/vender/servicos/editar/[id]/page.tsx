'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

const serviceSchema = z.object({
  name: z.string().min(3, 'O nome do serviço é obrigatório.'),
  description: z.string().min(10, "A descrição é obrigatória.").optional(),
  price: z.coerce.number().min(0, 'O preço deve ser 0 (a combinar) ou maior.'),
  attendanceType: z.enum(['presencial', 'online', 'ambos'], { required_error: "Selecione o tipo de atendimento."}),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

function EditServicePage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const [isPageLoading, setIsPageLoading] = useState(true);
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
    if (!firestore || !serviceId) return;

    const fetchService = async () => {
      setIsPageLoading(true);
      const docRef = doc(firestore, 'products', serviceId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const serviceData = docSnap.data() as Product;
        form.reset(serviceData);
      } else {
        toast.error("Serviço não encontrado.");
        router.push('/vender/servicos');
      }
      setIsPageLoading(false);
    };

    fetchService();
  }, [firestore, serviceId, form, router]);

  if (!isUserLoading && !user) {
    router.push('/login?redirect=/vender');
    return null;
  }

  async function onSubmit(values: ServiceFormValues) {
    if (!firestore || !user || !serviceId) {
      toast.error('Erro de autenticação ou ID do serviço faltando.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const docRef = doc(firestore, 'products', serviceId);
      await updateDoc(docRef, {
        ...values,
        updatedAt: serverTimestamp(),
      });

      toast.success('Serviço atualizado com sucesso!');
      router.push('/vender/servicos');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Não foi possível atualizar o serviço. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isPageLoading || isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender/servicos">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Editar Serviço</h1>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
              {isSubmitting ? 'Salvando alterações...' : 'Salvar Alterações'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}


export default function EditServicePageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>}>
            <EditServicePage />
        </Suspense>
    )
}
