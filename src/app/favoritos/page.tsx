'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/layout/BottomNav';

export default function FavoritesPage() {
  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] pb-16 shadow-2xl">
      <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/perfil">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto">Favoritos</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold mb-2">Sem favoritos ainda</h2>
        <p className="text-muted-foreground mb-4">
          Toque no coração para salvar seus itens preferidos aqui.
        </p>
        <Button asChild>
          <Link href="/home">Começar a procurar</Link>
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
