
'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, updateDoc, DocumentReference } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { WithId } from '@/firebase/firestore/use-doc';

const orderStatusOptions = [
  'Solicitação de Contato',
  'Pendente',
  'Confirmado',
  'Em Preparo',
  'Saiu para Entrega',
  'Entregue',
  'Cancelado',
];

interface Order {
  id: string;
  status: string;
}

interface StatusUpdaterProps {
  order: WithId<Order>;
  orderRef: DocumentReference;
}

export default function StatusUpdater({ order, orderRef }: StatusUpdaterProps) {
  const [currentStatus, setCurrentStatus] = React.useState(order.status);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    try {
      await updateDoc(orderRef, {
        status: newStatus,
        buyerHasUnread: true, // Notify the buyer
      });
      setCurrentStatus(newStatus);
      toast.success(`O pedido foi marcado como "${newStatus}".`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Não foi possível alterar o status do pedido.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Alterar status do pedido
          </p>
          <Select
            value={currentStatus}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              {orderStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
