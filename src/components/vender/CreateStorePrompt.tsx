'use client';

import Link from 'next/link';
import { Store as StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CreateStorePrompt() {
  return (
     <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center bg-transparent p-6 text-center shadow-2xl">
        <header className="absolute top-0 left-0 w-full flex items-center border-b p-4">
            <h1 className="font-headline text-xl">Seja um Vendedor</h1>
        </header>
        <main>
            <StoreIcon className="mx-auto h-20 w-20 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Crie sua loja para começar</h2>
            <p className="text-muted-foreground mb-6">
                É o primeiro passo para você poder anunciar seus produtos e serviços na nossa plataforma.
            </p>
            <Button size="lg" className="w-full" asChild>
                <Link href="/vender/loja">Criar minha loja</Link>
            </Button>
        </main>
    </div>
  )
}
