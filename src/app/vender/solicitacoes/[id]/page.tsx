'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon, Phone, MapPin, MessageSquare, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc, WithId } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusUpdater from '@/components/vender/StatusUpdater';

// Simplified types for the page
interface RequesterInfo {
    name: string;
    address: string;
    city: string;
    zip: string;
    phone: string;
}

interface ServiceRequest {
  id: string;
  requestDate: string;
  serviceName: string;
  status: string;
  requesterId: string; 
  providerId: string;
  requesterInfo: RequesterInfo;
  message?: string;
  providerHasUnread?: boolean;
}

export default function ServiceRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { firestore, user, isUserLoading } = useFirebase();

  const requestRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'serviceRequests', id as string);
  }, [firestore, id]);

  const { data: request, isLoading, error } = useDoc<ServiceRequest>(requestRef);

  useEffect(() => {
    if (!requestRef || !request || !user) return;
    
    // Mark as read if the provider is viewing it
    if (user.uid === request.providerId && request.providerHasUnread) {
        updateDoc(requestRef, { providerHasUnread: false }).catch(err => console.error("Failed to mark request as read:", err));
    }
  }, [request, user, requestRef]);

  if (isLoading || isUserLoading) {
    return <RequestDetailSkeleton />;
  }

  if (error || !request) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold">Solicitação não encontrada</h2>
        <p className="text-muted-foreground">A solicitação que você está procurando não existe ou você não tem permissão para vê-la.</p>
        <Button asChild variant="link">
          <Link href="/vender/pedidos">Voltar para Minhas Vendas</Link>
        </Button>
      </div>
    );
  }
  
  const isProvider = user?.uid === request.providerId;
  
  if (!isUserLoading && !isProvider) {
     router.push('/login');
     return null;
  }

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={"/vender/solicitacoes"}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          Solicitação #{request.id.substring(0, 7)}
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5"/>Detalhes da Solicitação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
             <p><strong>Data:</strong> {format(new Date(request.requestDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            <p><strong>Serviço:</strong> {request.serviceName}</p>
            <p><strong>Status:</strong> <span className="font-semibold text-accent">{request.status}</span></p>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Informações do Cliente
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
               <p><strong>{request.requesterInfo.name}</strong></p>
                <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {request.requesterInfo.phone}
                </p>
                <p className="pt-2 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                    <span>{request.requesterInfo.address}, {request.requesterInfo.city}, {request.requesterInfo.zip}</span>
                </p>
            </CardContent>
        </Card>

       {request.message && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Mensagem do Cliente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground italic">"{request.message}"</p>
            </CardContent>
        </Card>
       )}
      </main>
      
       <footer className="border-t bg-card p-4">
          <Button className="w-full" size="lg">Entrar em Contato</Button>
      </footer>
    </div>
  );
}

const RequestDetailSkeleton = () => (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-32 mx-auto" />
        <div className="w-10"></div>
      </header>
       <main className="flex-1 overflow-y-auto p-4 space-y-4">
         <Skeleton className="h-32 w-full" />
         <Skeleton className="h-40 w-full" />
         <Skeleton className="h-24 w-full" />
       </main>
      <footer className="border-t bg-card p-2">
        <Skeleton className="h-12 w-full" />
      </footer>
    </div>
)
