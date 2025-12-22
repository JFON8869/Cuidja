'use client';

import Link from 'next/link';
import { ArrowLeft, CreditCard, Landmark, MessageSquare, Siren, Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { Label } from '@/components/ui/label';
import { useProductContext } from '@/context/ProductContext';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório.'),
  address: z.string().min(5, 'Endereço é obrigatório.'),
  city: z.string().min(3, 'Cidade é obrigatória.'),
  zip: z.string().min(8, 'CEP é obrigatório.'),
  paymentMethod: z.enum(['card', 'pix'], {
    required_error: 'Selecione um método de pagamento.',
  }),
  message: z.string().optional(),
  isUrgent: z.boolean().default(false),
});


export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);

  // This assumes all items in cart are from the same seller for simplicity.
  const firstProductInCart = cart.length > 0 ? cart[0] : null;
  const productStoreId = firstProductInCart?.storeId;

  const urgentCategories = useMemo(() => ['Gás e Água', 'Farmácias'], []);
  const isUrgentCategory = useMemo(() => {
    return cart.some(item => urgentCategories.includes(item.category));
  }, [cart, urgentCategories]);


  useEffect(() => {
    async function fetchStore() {
        if (!firestore || !productStoreId) {
            setIsLoadingStore(false);
            return;
        };
        // This is not ideal, in a real app we'd get the storeId from the product directly
        // or have a more efficient way to query.
        // For this mock, we assume the storeId from the product is the doc ID in 'stores' collection.
        // But since we don't have a direct 'stores' collection with docs matching storeId, we will query by name
        // This logic is flawed and depends on mock data structure.
        
        // Let's assume product.storeId IS the document ID for the store for simplicity.
        setStoreId(productStoreId);
        setIsLoadingStore(false);
    }
    fetchStore();
  }, [firestore, productStoreId])


  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      zip: '',
      message: '',
      isUrgent: isUrgentCategory,
    },
  });
  
  useEffect(() => {
    form.setValue('isUrgent', isUrgentCategory);
  }, [isUrgentCategory, form])

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (!firestore || !user) {
        toast({
            variant: 'destructive',
            title: 'Erro de autenticação',
            description: 'Você precisa estar logado para finalizar a compra.',
        });
        router.push('/login');
        return;
    }
     if (!storeId) {
      toast({
        variant: 'destructive',
        title: 'Erro no pedido',
        description: 'Não foi possível encontrar a loja para este pedido. Tente novamente.',
      });
      return;
    }
    
    try {
        const ordersCollection = collection(firestore, 'orders');
        
        const initialMessage = (isUrgentCategory && values.message) ? [{
            senderId: user.uid,
            text: values.message,
            timestamp: new Date().toISOString(),
            isRead: false,
        }] : [];

        const orderData: any = {
            userId: user.uid,
            storeId: storeId,
            productIds: cart.map(item => item.id),
            totalAmount: total,
            status: 'Pendente',
            orderDate: new Date().toISOString(),
            shippingAddress: {
                name: values.name,
                address: values.address,
                city: values.city,
                zip: values.zip,
            },
            paymentMethod: values.paymentMethod,
            category: firstProductInCart?.category, // Store category for later checks
            isUrgent: values.isUrgent,
        }

        if (isUrgentCategory) {
            orderData.messages = initialMessage;
            orderData.lastMessageTimestamp = initialMessage.length > 0 ? new Date().toISOString() : null;
            orderData.buyerHasUnreadMessages = false;
            orderData.sellerHasUnreadMessages = initialMessage.length > 0;
        }
        
        await addDoc(ordersCollection, orderData);

        toast({
            title: 'Pedido Recebido!',
            description: 'Sua compra foi finalizada com sucesso. Obrigado!',
        });
        
        clearCart();
        router.push('/pedidos');
    } catch(error) {
        console.error("Error placing order: ", error);
        toast({
            variant: 'destructive',
            title: 'Uh oh! Algo deu errado.',
            description: 'Não foi possível finalizar seu pedido. Tente novamente.',
        });
    }
  }
  
  if (cart.length === 0) {
    return (
        <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center bg-transparent shadow-2xl">
            <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
             <Button asChild>
              <Link href="/home">Começar a comprar</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/carrinho">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Finalizar Compra</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-headline text-lg">
                <Truck className="h-5 w-5" />
                Endereço de Entrega
              </h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
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
            
            {isUrgentCategory && (
                <>
                <Separator />
                <section className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isUrgent"
                    render={({ field }) => (
                      <FormItem className={cn("flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm", field.value && "border-destructive bg-destructive/10")}>
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                             <Siren className={cn("h-5 w-5", field.value && "text-destructive")}/>
                             Pedido Urgente
                          </FormLabel>
                          <FormDescription>
                            Prioridade máxima para o vendedor.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div>
                    <h2 className="mb-2 flex items-center gap-2 font-headline text-lg">
                        <MessageSquare className="h-5 w-5" />
                        Mensagem (Opcional)
                    </h2>
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Textarea
                                placeholder="Deixe uma observação, como ponto de referência ou detalhes."
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                </section>
                </>
            )}

            <Separator />

            <section>
              <h2 className="mb-3 font-headline text-lg">Resumo do Pedido</h2>
              <Card>
                <CardContent className="p-4 space-y-3">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="line-clamp-1 flex-1 pr-4">{item.name}</span>
                            <span className="text-muted-foreground">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                            </span>
                        </div>
                    ))}
                    <Separator />
                     <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                        </span>
                     </div>
                </CardContent>
              </Card>
            </section>

             <Separator />

            <section>
                <h2 className="mb-3 font-headline text-lg">Forma de Pagamento</h2>
                <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                        >
                        <FormItem>
                            <FormControl>
                            <RadioGroupItem value="card" id="card" className="sr-only" />
                            </FormControl>
                            <Label htmlFor="card" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <CreditCard className="mb-3 h-6 w-6" />
                                Cartão
                            </Label>
                        </FormItem>
                         <FormItem>
                            <FormControl>
                            <RadioGroupItem
                                value="pix"
                                id="pix"
                                className="sr-only"
                            />
                            </FormControl>
                            <Label htmlFor="pix" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                <Landmark className="mb-3 h-6 w-6" />
                                PIX
                            </Label>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage className="pt-2" />
                    </FormItem>
                )}
                />
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
          disabled={form.formState.isSubmitting || isLoadingStore || !storeId}
        >
          {form.formState.isSubmitting ? 'Finalizando...' : 'Finalizar Pedido'}
        </Button>
      </footer>
    </div>
  );
}
