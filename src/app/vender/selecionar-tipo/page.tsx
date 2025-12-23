'use client';

import Link from 'next/link';
import { ArrowLeft, Package, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SelectItemTypePage() {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Criar Novo Anúncio</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center space-y-8 p-8">
        <h2 className="text-center font-headline text-2xl">O que você deseja anunciar?</h2>
        <div className="w-full space-y-4">
          <Link href="/vender/novo-produto" className="block">
            <Card className="flex cursor-pointer flex-col items-center justify-center p-8 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-lg">
              <Package className="mb-4 h-12 w-12 text-primary" />
              <h3 className="font-bold text-lg">Produto</h3>
              <p className="text-sm text-muted-foreground">Itens físicos como comida, artesanato, roupas, etc.</p>
            </Card>
          </Link>
          <Link href="/vender/novo-servico" className="block">
            <Card className="flex cursor-pointer flex-col items-center justify-center p-8 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-lg">
              <Wrench className="mb-4 h-12 w-12 text-primary" />
              <h3 className="font-bold text-lg">Serviço</h3>
              <p className="text-sm text-muted-foreground">Trabalhos como aulas, consertos, consultorias, etc.</p>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
