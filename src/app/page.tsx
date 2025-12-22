'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col items-center justify-center bg-transparent p-6 text-center shadow-2xl">
      <div className="flex flex-col items-center justify-center">
        <h1 className="cuidja-logo-text font-logo text-8xl leading-tight">
          Cuidja
        </h1>
        <p className="mt-4 max-w-xs text-lg text-muted-foreground">
          O seu mercado local, conectando produtores e consumidores.
        </p>
      </div>

      <Button asChild size="lg" className="absolute bottom-24 w-full max-w-xs">
        <Link href="/home">Entrar na Loja</Link>
      </Button>
    </div>
  );
}
