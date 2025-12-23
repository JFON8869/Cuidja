'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { OrderChat } from '@/components/pedidos/OrderChat';
import { OrderDetails } from '@/components/pedidos/OrderDetails';
import { Skeleton } from '@/components/ui/skeleton';

function OrderPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col bg-background shadow-2xl">
        <OrderDetails orderId={orderId} />
        <OrderChat orderId={orderId} />
    </div>
  );
}

function OrderPageSkeleton() {
    return (
        <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col bg-background shadow-2xl">
            <header className="flex items-center gap-4 border-b p-4">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
            </main>
            <footer className="border-t p-4">
                <Skeleton className="h-10 w-full" />
            </footer>
        </div>
    )
}

export default function OrderPageWrapper() {
  return (
    <Suspense fallback={<OrderPageSkeleton />}>
      <OrderPage />
    </Suspense>
  );
}
