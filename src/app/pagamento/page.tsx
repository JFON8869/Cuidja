
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();
  const { firestore } = useFirebase();
  
  const qrCodeImage = PlaceHolderImages.find(img => img.id === 'qr-code-pix');

  const orderRef = useMemoFirebase(() => {
    if (!firestore || !orderId) return null;
    return doc(firestore, 'orders', orderId);
  }, [firestore, orderId]);

  const { data: order, isLoading, error } = useDoc(orderRef);

  const handleConfirmPayment = async () => {
    if (!orderRef) return;
    try {
      await updateDoc(orderRef, {
        status: 'Confirmado',
      });
      toast.success('Pagamento Confirmado! Seu pedido foi confirmado e o vendedor notificado.');
      router.push('/pedidos');
    } catch (err) {
      console.error('Failed to confirm payment:', err);
      toast.error('Erro ao confirmar pagamento.');
    }
  };

  const copyPixCode = () => {
    const pixCode = "00020126360014br.gov.bcb.pix0114+5511999999999520400005303986540510.005802BR5913NOME DO VENDEDOR6009SAO PAULO62070503***6304E4D3";
    navigator.clipboard.writeText(pixCode);
    toast.success('Código PIX copiado!');
  };

  if (isLoading) {
    return <PaymentPageSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Pedido não encontrado</h2>
        <p className="text-muted-foreground">
          O pedido que você está tentando pagar não foi encontrado.
        </p>
        <Button asChild variant="link">
          <Link href="/pedidos">Voltar para Meus Pedidos</Link>
        </Button>
      </div>
    );
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pedido</span>
              <span className="font-mono">#{orderId?.substring(0, 7)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(order.totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        {order.paymentMethod === 'pix' ? (
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
            >
              Já paguei, confirmar pedido
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
            >
              <CreditCard className="mr-2" />
              Pagar com Cartão
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
