
'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Briefcase, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, doc } from 'firebase/firestore';
import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { Textarea } from '@/components/ui/textarea';
import { Service } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, WithId } from '@/firebase/firestore/use-doc';

const serviceCheckoutSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório.'),
  phone: z.string().min(10, 'Telefone é obrigatório.'),
  address: z.string().min(5, 'Endereço é obrigatório.'),
  city: z.string().min(3, 'Cidade é obrigatória.'),
  zip: z.string().min(8, 'CEP é obrigatório.'),
  message: z.string().optional(),
});


export default function ServiceCheckoutPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const storeId = searchParams.get('storeId');
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user, isUserLoading } = useFirebase();

  const serviceRef = useMemoFirebase(() => {
    if (!firestore || !serviceId) return null;
    return doc(firestore, 'services', serviceId);
  }, [firestore, serviceId]);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: service, isLoading: isLoadingService } = useDoc<WithId<Service>>(serviceRef);
  const { data: userData, isLoading: isLoadingUserDoc } = useDoc(userDocRef);

  const form = useForm<z.infer<typeof serviceCheckoutSchema>>({
    resolver: zodResolver(serviceCheckoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      city: '',
      zip: '',
      message: '',
    },
  });
  
  useEffect(() => {
    // Pre-fill form when user data is loaded
    if (userData) {
      const defaultAddress = userData.addresses && userData.addresses.length > 0 ? userData.addresses[0] : null;
      form.reset({
        name: userData.name || '',
        phone: userData.phone || '',
        address: defaultAddress ? `${defaultAddress.street}, ${defaultAddress.number}` : '',
        city: defaultAddress?.city || '',
        zip: defaultAddress?.zip || '',
        message: form.getValues('message'),
      });
    } else if (user) {
      // Fallback to basic user info if firestore data is not available yet
      form.reset({
        name: user.displayName || '',
        phone: user.phoneNumber || '',
        address: '',
        city: '',
        zip: '',
        message: form.getValues('message'),
      });
    }
  }, [userData, user, form]);

  
  async function onSubmit(values: z.infer<typeof serviceCheckoutSchema>) {
    if (!firestore || !user || !service || !storeId) {
        toast({
            variant: 'destructive',
            title: 'Erro de autenticação ou serviço',
            description: 'Você precisa estar logado e o serviço deve ser válido.',
        });
        if (!user) router.push('/login');
        return;
    }
    
    try {
        const serviceRequestsCollection = collection(firestore, 'serviceRequests');
        
        const requestData = {
            requesterId: user.uid,
            providerId: service.sellerId, // The actual user ID of the seller
            storeId: storeId,
            serviceId: service.id,
            serviceName: service.name,
            requesterInfo: {
                name: values.name,
                phone: values.phone,
                address: values.address,
                city: values.city,
                zip: values.zip,
            },
            message: values.message || '',
            status: 'Pendente', // Initial status
            requestDate: new Date().toISOString(),
            providerHasUnread: true,
            requesterHasUnread: false
        }
        
        const docRef = await addDoc(serviceRequestsCollection, requestData);

        toast({
            title: 'Solicitação Enviada!',
            description: 'Seu pedido de serviço foi enviado. O prestador entrará em contato.',
        });
        
        router.push(`/home`);
    } catch(error) {
        console.error("Error creating service request: ", error);
        toast({
            variant: 'destructive',
            title: 'Uh oh! Algo deu errado.',
            description: 'Não foi possível solicitar o serviço. Tente novamente.',
        });
    }
  }
  
  const isLoading = isLoadingService || isUserLoading || isLoadingUserDoc;

  if (isLoading) {
    return (
        <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
            <header className="flex items-center border-b p-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="mx-auto h-6 w-48" />
                <div className="w-10"></div>
            </header>
            <main className="flex-1 space-y-6 p-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-40 w-full" />
            </main>
        </div>
    )
  }

  if (!service) {
    return (
        <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center bg-transparent shadow-2xl">
            <h1 className="text-2xl font-bold mb-4">Serviço não encontrado</h1>
             <Button asChild>
              <Link href="/categorias/servicos">Voltar</Link>
            </Button>
        </div>
    )
  }
  
  const hasFee = service?.visitFee && service.visitFee > 0;

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
        <h1 className="mx-auto font-headline text-xl">Solicitar Serviço</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-headline text-lg">
                <Briefcase className="h-5 w-5" />
                Resumo da Solicitação
              </h2>
              <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="line-clamp-1 flex-1 pr-4 font-semibold">{service.name}</span>
                    </div>
                     <div className="flex justify-between items-center font-bold text-lg">
                        <span>{hasFee ? 'Taxa de Visita/Contato' : 'Custo do Contato'}</span>
                        <span>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.visitFee || 0)}
                        </span>
                     </div>
                </CardContent>
              </Card>
            </section>
            
            <Separator />

             <section>
              <h2 className="mb-3 flex items-center gap-2 font-headline text-lg">
                <MapPin className="h-5 w-5" />
                Informações de Contato e Endereço
              </h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seu Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
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
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 90000-0000" {...field} />
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
                        <Input placeholder="Rua, número e bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>
            </section>
            
            <Separator />
            
             <section>
              <h2 className="mb-3 flex items-center gap-2 font-headline text-lg">
                <MessageSquare className="h-5 w-5" />
                Mensagem Inicial (Opcional)
              </h2>
              <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Textarea
                            placeholder="Descreva brevemente o que você precisa. Ex: 'Gostaria de um orçamento para um armário de cozinha'."
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
            </section>

          </form>
        </Form>
      </main>
      <footer className="border-t bg-card p-4">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting || isLoading}
        >
          {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
        </Button>
      </footer>
    </div>
  );
}
