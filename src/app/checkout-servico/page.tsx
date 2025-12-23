'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import {
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { Suspense, useEffect, useState } from 'react';
import { Product } from '@/lib/data';
import { useDoc } from '@/firebase/firestore/use-doc';

const serviceRequestSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório.'),
  phone: z.string().min(10, 'Telefone é obrigatório.'),
  message: z.string().optional(),
});

function ServiceCheckoutPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const storeId = searchParams.get('storeId');
  const [sellerId, setSellerId] = useState<string | null>(null);

  const serviceRef = useMemoFirebase(() => {
    if (!firestore || !serviceId) return null;
    return doc(firestore, 'products', serviceId);
  }, [firestore, serviceId]);
  
  const { data: service, isLoading: isServiceLoading } = useDoc(serviceRef);

  useEffect(() => {
      const fetchSellerId = async () => {
          if (!firestore || !storeId) return;
          const storeRef = doc(firestore, 'stores', storeId);
          const storeSnap = await getDoc(storeRef);
          if (storeSnap.exists()) {
              setSellerId(storeSnap.data().userId);
          }
      };
      fetchSellerId();
  }, [firestore, storeId]);


  const form = useForm<z.infer<typeof serviceRequestSchema>>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      name: user?.displayName || '',
      phone: user?.phoneNumber || '',
      message: '',
    },
  });
  
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.displayName || '',
        phone: user.phoneNumber || '',
        message: '',
      })
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof serviceRequestSchema>) {
    if (!firestore || !user || !service || !storeId || !sellerId) {
      toast.error('Não foi possível enviar a solicitação. Faltam informações.');
      return;
    }

    try {
      const docRef = await addDoc(collection(firestore, 'orders'), {
        orderType: 'SERVICE_REQUEST',
        customerId: user.uid,
        sellerId: sellerId,
        storeId: storeId,
        serviceId: service.id,
        serviceName: service.name,
        customerName: values.name,
        customerPhone: values.phone,
        status: 'Solicitação Recebida',
        requestDate: serverTimestamp(),
        sellerHasUnread: true,
        buyerHasUnread: false,
        lastMessageTimestamp: serverTimestamp(),
      });
      
      // Add the initial message if provided
      if (values.message) {
        const messagesCol = collection(firestore, 'orders', docRef.id, 'messages');
        await addDoc(messagesCol, {
            senderId: user.uid,
            text: values.message,
            timestamp: serverTimestamp(),
        })
      }

      toast.success('Solicitação enviada com sucesso!');
      router.push(`/pedidos/${docRef.id}`);
    } catch (error) {
      console.error('Error creating service request: ', error);
      toast.error('Não foi possível enviar a solicitação. Tente novamente.');
    }
  }
  
  if (isUserLoading || isServiceLoading) {
      return (
           <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )
  }
  
  if (!user) {
      router.push(`/login?redirect=/checkout-servico?serviceId=${serviceId}&storeId=${storeId}`);
      return null;
  }
  
  if (!service) {
      return <p>Serviço não encontrado.</p>
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/lojas/${storeId}`}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Solicitar Serviço</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className='mb-6 text-center'>
            <h2 className='text-2xl font-bold'>{service.name}</h2>
            <p className='text-muted-foreground'>
                Preencha seus dados para iniciar uma conversa com o prestador.
            </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone para Contato</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem Inicial (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva brevemente o que você precisa ou faça uma pergunta."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Isso ajuda o prestador a entender sua necessidade.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </main>
      <footer className="border-t p-4">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting}
          className="w-full"
          size="lg"
        >
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : "Enviar Solicitação"}
        </Button>
      </footer>
    </div>
  );
}


export default function ServiceCheckoutPageWrapper() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <ServiceCheckoutPage />
        </Suspense>
    )
}
