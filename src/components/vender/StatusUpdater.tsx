
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
  'Pendente',
  'Confirmado',
  'Em Preparo',
  'Saiu para Entrega',
  'Entregue',
  'Cancelado',
];

const serviceStatusOptions = [
  'Solicitação recebida',
  'Em conversa',
  'Orçamento enviado',
  'Em execução',
  'Concluído',
  'Cancelado',
];

interface Request {
  id: string;
  status: string;
}

interface StatusUpdaterProps {
  request: WithId<Request>;
  requestRef: DocumentReference;
  type: 'order' | 'service';
}

export default function StatusUpdater({ request, requestRef, type }: StatusUpdaterProps) {
  const [currentStatus, setCurrentStatus] = React.useState(request.status);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const statusOptions = type === 'order' ? orderStatusOptions : serviceStatusOptions;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    try {
      await updateDoc(requestRef, {
        status: newStatus,
        buyerHasUnread: true, // Notify the buyer
      });
      setCurrentStatus(newStatus);
      toast.success(`O status foi atualizado para "${newStatus}".`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Não foi possível alterar o status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar {type === 'order' ? 'Pedido' : 'Solicitação'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Alterar status
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
              {statusOptions.map((status) => (
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
