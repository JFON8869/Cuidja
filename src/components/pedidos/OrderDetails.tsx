'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, User, Store, Package, Wrench, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import StatusUpdater from './StatusUpdater';

interface OrderDetailsProps {
    orderId: string;
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
    const { firestore, user } = useFirebase();
    const [storeData, setStoreData] = useState<{name: string} | null>(null);
    const [customerData, setCustomerData] = useState<{name: string, email: string} | null>(null);

    const orderRef = useMemoFirebase(() => {
        if (!firestore || !orderId) return null;
        return doc(firestore, 'orders', orderId);
    }, [firestore, orderId]);

    const { data: order, isLoading } = useDoc(orderRef);
    
    const isSeller = user?.uid === order?.sellerId;
    const isBuyer = user?.uid === order?.customerId;

    useEffect(() => {
        const fetchRelatedData = async () => {
            if (!firestore || !order) return;

            // Fetch store data
            const storeRef = doc(firestore, 'stores', order.storeId);
            const storeSnap = await getDoc(storeRef);
            if (storeSnap.exists()) {
                setStoreData(storeSnap.data() as {name: string});
            }

            // Fetch customer data
            const userRef = doc(firestore, 'users', order.customerId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setCustomerData(userSnap.data() as {name: string, email: string});
            }
        };

        fetchRelatedData();

        // Mark messages as read when component mounts
        const markAsRead = async () => {
            if (!orderRef || !order || !user) return;

            const fieldToUpdate = isSeller ? 'sellerHasUnread' : 'buyerHasUnread';
            if (order[fieldToUpdate]) {
                 await updateDoc(orderRef, { [fieldToUpdate]: false });
            }
        };

        markAsRead();

    }, [firestore, order, orderRef, isSeller, user]);


    if (isLoading || !order || !storeData || !customerData) {
        return (
             <header className="flex items-center gap-4 border-b p-4">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </header>
        )
    }

    const title = order.orderType === 'PURCHASE' 
        ? `Pedido #${order.id.substring(0, 7)}`
        : `Solicitação: ${order.serviceName}`;
    
    const otherParty = isSeller ? customerData : storeData;
    const otherPartyName = otherParty?.name || '...';


    return (
        <header className="flex items-center gap-4 border-b p-4">
          <Button variant="ghost" size="icon" asChild>
              <Link href="/pedidos">
                  <ArrowLeft />
              </Link>
          </Button>
           <div className="flex-1">
                <h1 className="font-headline text-lg leading-tight">{title}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {isSeller ? <User size={14}/> : <Store size={14} />}
                    Conversa com {otherPartyName}
                </p>
           </div>
          {isSeller && <StatusUpdater order={order} />}
           {!isSeller && <Badge variant="secondary">{order.status}</Badge>}
        </header>
    )
}
