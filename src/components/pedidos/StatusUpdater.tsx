'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { PurchaseStatus, ServiceRequestStatus, OrderType } from '@/lib/data';
import { toast } from 'react-hot-toast';

interface StatusUpdaterProps {
  order: {
    id: string;
    orderType: OrderType;
    status: string;
  };
}

export default function StatusUpdater({ order }: StatusUpdaterProps) {
  const { firestore } = useFirebase();

  const handleStatusChange = async (newStatus: string) => {
    if (!firestore || !order) return;
    const orderRef = doc(firestore, 'orders', order.id);
    try {
      await updateDoc(orderRef, {
        status: newStatus,
        buyerHasUnread: true,
        lastMessageTimestamp: serverTimestamp(),
      });
      toast.success(`Status do pedido atualizado para "${newStatus}"`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Erro ao atualizar status.');
    }
  };

  const availableStatuses =
    order.orderType === 'PURCHASE' ? PurchaseStatus : ServiceRequestStatus;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span>{order.status}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {availableStatuses.map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={status === order.status}
            onSelect={() => handleStatusChange(status)}
          >
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
