'use client';

import Link from 'next/link';
import { ArrowLeft, CreditCard, Landmark, Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
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
import { useFirebase } from '@/firebase';
import { Label } from '@/components/ui/label';

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório.'),
  address: z.string().min(5, 'Endereço é obrigatório.'),
  city: z.string().min(3, 'Cidade é obrigatória.'),
  zip: z.string().min(8, 'CEP é obrigatório.'),
  paymentMethod: z.enum(['card', 'pix'], {
    required_error: 'Selecione um método de pagamento.',
  }),
});

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      zip: '',
    },
  });

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
    
    console.log(values);

    try {
        const ordersCollection = collection(firestore, 'orders');
        await addDoc(ordersCollection, {
            userId: user.uid,
            products: cart.map(item => ({ id: item.id, name: item.name, price: item.price })),
            totalAmount: total,
            status: 'Pending',
            orderDate: new Date().toISOString(),
            shippingAddress: {
                name: values.name,
                address: values.address,
                city: values.city,
                zip: values.zip,
            },
            paymentMethod: values.paymentMethod,
        });

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
          disabled={form.formState.isSubmitting}
        >
          Finalizar Pedido
        </Button>
      </footer>
    </div>
  );
}
