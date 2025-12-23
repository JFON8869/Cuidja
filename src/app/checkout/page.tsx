
'use client';

import Link from 'next/link';
import { ArrowLeft, CreditCard, Landmark, Siren, Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useEffect, useMemo } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório.'),
  phone: z.string().min(10, 'Telefone é obrigatório.'),
  address: z.string().min(5, 'Endereço é obrigatório.'),
  city: z.string().min(3, 'Cidade é obrigatória.'),
  zip: z.string().min(8, 'CEP é obrigatório.'),
  paymentMethod: z.enum(['card', 'pix'], {
    required_error: 'Selecione um método de pagamento.',
  }),
  isUrgent: z.boolean().default(false),
});

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const router = useRouter();
  const { firestore, user } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc(userDocRef);

  const firstProductInCart = cart.length > 0 ? cart[0] : null;
  const storeId = firstProductInCart?.storeId;
  
  const urgentCategories = useMemo(() => ['Gás e Água', 'Farmácias'], []);
  const isUrgentCategory = useMemo(() => {
    return cart.some(item => urgentCategories.includes(item.category));
  }, [cart, urgentCategories]);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      city: '',
      zip: '',
      isUrgent: isUrgentCategory,
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
        paymentMethod: form.getValues('paymentMethod'),
        isUrgent: form.getValues('isUrgent'),
      });
    } else if (user) {
      // Fallback to basic user info if firestore data is not available yet
       form.reset({
        name: user.displayName || '',
        phone: user.phoneNumber || '',
        address: '',
        city: '',
        zip: '',
        paymentMethod: form.getValues('paymentMethod'),
        isUrgent: form.getValues('isUrgent'),
       });
    }
  }, [userData, user, form]);

  useEffect(() => {
    form.setValue('isUrgent', isUrgentCategory);
  }, [isUrgentCategory, form])

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (!firestore || !user) {
        toast.error('Você precisa estar logado para finalizar a compra.');
        router.push('/login');
        return;
    }
     if (!storeId) {
      toast.error('Não foi possível encontrar a loja para este pedido. Tente novamente.');
      return;
    }
    
    try {
        const ordersCollection = collection(firestore, 'orders');
        
        const orderData = {
            customerId: user.uid,
            storeId: storeId,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                selectedAddons: item.selectedAddons || []
            })),
            totalAmount: total,
            status: 'Aguardando Pagamento', // Initial status
            orderDate: new Date().toISOString(),
            shippingAddress: {
                name: values.name,
                street: values.address,
                city: values.city,
                zip: values.zip,
                number: '', // address field now has street and number
            },
            phone: values.phone,
            paymentMethod: values.paymentMethod,
            isUrgent: values.isUrgent,
            // For seller notification system
            sellerHasUnread: true,
            buyerHasUnread: false,
            messages: []
        };
        
        const docRef = await addDoc(ordersCollection, orderData);

        toast.success('Seu pedido foi criado. Redirecionando para o pagamento.');
        
        clearCart();
        router.push(`/pagamento?orderId=${docRef.id}`);

    } catch(error) {
        console.error("Error placing order: ", error);
        toast.error('Não foi possível finalizar seu pedido. Tente novamente.');
    }
  }

  const calculateItemTotal = (item: any) => {
    const addonsTotal = item.selectedAddons?.reduce((acc: any, addon: any) => acc + (addon.price * addon.quantity), 0) || 0;
    return (item.price * item.quantity) + addonsTotal;
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone para Contato</FormLabel>
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
            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className={cn("flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm", field.value && "border-destructive bg-destructive/10", !isUrgentCategory && 'hidden')}>
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
                      disabled={!isUrgentCategory}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            

            <Separator />

            <section>
              <h2 className="mb-3 font-headline text-lg">Resumo do Pedido</h2>
              <Card>
                <CardContent className="p-4 space-y-3">
                    {cart.map(item => (
                        <div key={item.cartItemId} className="flex justify-between items-start text-sm">
                            <div className="flex-1 pr-4">
                                <p className="font-semibold line-clamp-1">{item.quantity}x {item.name}</p>
                                {item.selectedAddons && item.selectedAddons.length > 0 && (
                                    <ul className="text-xs text-muted-foreground mt-1">
                                        {item.selectedAddons.map(addon => (
                                            <li key={addon.name}>+ {addon.quantity}x {addon.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <span className="text-muted-foreground">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateItemTotal(item))}
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
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Criando pedido...' : 'Ir para Pagamento'}
        </Button>
      </footer>
    </div>
  );
}

    