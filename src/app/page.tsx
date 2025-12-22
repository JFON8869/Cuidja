'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { handleGoogleSignIn } from '@/lib/auth-actions';
import { useFirebase } from '@/firebase';

export default function WelcomePage() {
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const [isGoogleLoading, setGoogleLoading] = useState(false);

  const onGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    await handleGoogleSignIn(auth, firestore, router, toast, setGoogleLoading);
  };

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col items-center justify-center bg-transparent p-6 text-center shadow-2xl">
      <div className="flex flex-col items-center justify-center">
        <h1 className="cuidja-logo-text font-logo text-8xl leading-tight">
          Cuidja
        </h1>
        <p className="mt-4 max-w-xs text-lg font-headline tracking-widest uppercase">
          O Seu Comércio Local
        </p>
      </div>

      <div className="absolute bottom-16 w-full max-w-xs space-y-4">
        <Button onClick={onGoogleSignIn} size="lg" className="w-full" disabled={isGoogleLoading}>
          {isGoogleLoading ? 'Entrando...' : 'Entrar com Google'}
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href="/home">Entrar como Visitante</Link>
        </Button>
        <p className="text-xs text-muted-foreground">
            Já tem uma conta? <Link href="/login" className="text-primary underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}
