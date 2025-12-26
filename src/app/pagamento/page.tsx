'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CreditCard,
  Copy,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { collection, addDoc, doc, getDoc, writeBatch } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCart } from '@/context/CartContext';
import { Store } from '@/lib/data';

// V3 Change: Define a type for the data we expect from localStorage
interface CheckoutData {
    formValues: {
        name: string;
        phone: string;
        address: string;
        city: string;
        zip: string;
        paymentMethod: 'card' | 'pix';
        isUrgent: boolean;
    };
    cart: any[];
    total: number;
}


function PaymentPage() {
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const { clearCart } = useCart();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code-pix');

  // V3 Change: Load data from localStorage on component mount
  useEffect(() => {
    const data = localStorage.getItem('checkoutData');
    if (data) {
        try {
            const parsedData: CheckoutData = JSON.parse(data);
            setCheckoutData(parsedData);
        } catch (error) {
             console.error("Failed to parse checkout data from localStorage", error);
             toast.error("Erro ao carregar dados da compra.");
             router.push('/carrinho');
        }
    } else {
        // If there's no data, user probably landed here directly. Redirect.
        router.push('/carrinho');
    }
  }, [router]);

  // Effect to fetch the sellerId from the store document once checkoutData is available
  useEffect(() => {
    const fetchSellerId = async () => {
      if (!firestore || !checkoutData || checkoutData.cart.length === 0) {
        if(checkoutData) setIsLoading(false); // Stop loading if cart is empty
        return;
      };
      
      setIsLoading(true);
      const storeId = checkoutData.cart[0].storeId;
      const storeRef = doc(firestore, 'stores', storeId);

      try {
        const storeSnap = await getDoc(storeRef);
        if (storeSnap.exists()) {
            const storeData = storeSnap.data() as Store;
            setSellerId(storeData.userId);
        } else {
            toast.error("Vendedor não encontrado. A compra não pode ser completada.");
            router.push('/carrinho');
        }
      } catch (error) {
        console.error("Error fetching seller ID:", error);
        toast.error("Erro ao buscar informações do vendedor.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSellerId();
  }, [firestore, checkoutData, router]);

  // V3 Change: The core logic now resides here.
  const handleConfirmPayment = async () => {
    if (!firestore || !user || !checkoutData || !sellerId) {
      toast.error('Informações da compra incompletas. Tente novamente.');
      return;
    }

    setIsProcessing(true);
    
    // Create the order document
    const orderData = {
        customerId: user.uid,
        sellerId: sellerId,
        storeId: checkoutData.cart[0].storeId,
        orderType: 'PURCHASE' as const,
        items: checkoutData.cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selectedAddons: item.selectedAddons || []
        })),
        totalAmount: checkoutData.total,
        status: 'Pendente', // V3 Change: Status starts as 'Pendente'
        orderDate: new Date().toISOString(),
        shippingAddress: {
            name: checkoutData.formValues.name,
            street: checkoutData.formValues.address,
            city: checkoutData.formValues.city,
            zip: checkoutData.formValues.zip,
            number: '', // The 'address' field contains street and number
        },
        phone: checkoutData.formValues.phone,
        paymentMethod: checkoutData.formValues.paymentMethod,
        isUrgent: checkoutData.formValues.isUrgent,
        sellerHasUnread: true,
        buyerHasUnread: false,
    };

    try {
        // Use a batch write to create the order and update its status
        const batch = writeBatch(firestore);
        const orderRef = doc(collection(firestore, 'orders'));

        // 1. Create the order with 'Pendente' status
        batch.set(orderRef, orderData);
        // 2. Immediately update the status to 'Confirmado'
        batch.update(orderRef, { status: 'Confirmado' });

        await batch.commit();
        
        toast.success('Pagamento Confirmado! Seu pedido foi criado.');
        
        // Clean up
        clearCart();
        localStorage.removeItem('checkoutData');

        // Redirect to the newly created order's page
        router.push(`/pedidos/${orderRef.id}`);

    } catch (err) {
      console.error('Failed to create order:', err);
      toast.error('Erro ao criar o pedido.');
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    const pixCode = "00020126360014br.gov.bcb.pix0114+5511999999999520400005303986540510.005802BR5913NOME DO VENDEDOR6009SAO PAULO62070503***6304E4D3";
    navigator.clipboard.writeText(pixCode);
    toast.success('Código PIX copiado!');
  };

  if (isLoading || !checkoutData) {
    return <PaymentPageSkeleton />;
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/checkout">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Pagamento</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(checkoutData.total)}
              </span>
            </div>
          </CardContent>
        </Card>

        {checkoutData.formValues.paymentMethod === 'pix' ? (
          <div className="mt-6 space-y-4 text-center">
            <h2 className="font-headline text-xl">Pague com PIX</h2>
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code abaixo com o app do seu banco.
            </p>
            {qrCodeImage && (
              <Image
                src={qrCodeImage.imageUrl}
                alt="QR Code PIX"
                width={250}
                height={250}
                className="mx-auto rounded-lg border p-2"
                data-ai-hint="qr code"
              />
            )}
            <div className="relative">
              <Input
                readOnly
                value="00020126360014br.gov.bcb.pix0114+55119999..."
                className="pr-10"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                onClick={copyPixCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleConfirmPayment}
              disabled={isProcessing || !sellerId}
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : 'Já paguei, confirmar pedido'}
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <h2 className="font-headline text-xl">Pagar com Cartão</h2>
            <p className="text-sm text-muted-foreground">
              Preencha os dados do seu cartão. (Apenas para fins de simulação)
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
              </div>
              <div>
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input id="cardName" placeholder="Seu nome como no cartão" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cardExpiry">Validade</Label>
                  <Input id="cardExpiry" placeholder="MM/AA" />
                </div>
                <div>
                  <Label htmlFor="cardCvv">CVV</Label>
                  <Input id="cardCvv" placeholder="123" />
                </div>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleConfirmPayment}
              disabled={isProcessing || !sellerId}
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <CreditCard className="mr-2" />}
              Pagar e Finalizar Pedido
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}


function PaymentPageSkeleton() {
    return (
         <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
            <header className="flex items-center border-b p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <div className="w-10"></div>
            </header>
            <main className="p-4 space-y-6">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </main>
        </div>
    )
}

export default function PaymentPageWrapper() {
  return (
    <Suspense fallback={<PaymentPageSkeleton />}>
      <PaymentPage />
    </Suspense>
  );
}
