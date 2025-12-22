'use client';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddressesPage() {
  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl">
      <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/perfil">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto">Endereços Salvos</h1>
        <Button variant="ghost" size="icon">
            <PlusCircle />
        </Button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold mb-2">Nenhum endereço salvo</h2>
        <p className="text-muted-foreground mb-4">
          Adicione endereços para facilitar suas próximas compras.
        </p>
        <Button>
            <PlusCircle className="mr-2" />
            Adicionar Novo Endereço
        </Button>
      </main>
    </div>
  );
}
