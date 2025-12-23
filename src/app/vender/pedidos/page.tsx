
'use client';

import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function SellerOrdersPage() {

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          Meus Pedidos de Venda
        </h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
          <Construction className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Em Construção</h2>
            <p className="text-muted-foreground">
              Estamos trabalhando para trazer a melhor experiência de gestão de pedidos para você.
            </p>
            <Button asChild variant="link" className="mt-4">
                <Link href="/vender">Voltar ao Painel</Link>
            </Button>
      </main>
    </div>
  );
}
