'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function WelcomePage() {
  const { auth } = useFirebase();
  const router = useRouter();
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleGuestSignIn = async () => {
    if (!auth) {
        toast.error("O serviço de autenticação não está disponível. Tente novamente mais tarde.");
        return;
    }
    setIsGuestLoading(true);
    try {
        await signInAnonymously(auth);
        toast.success("Bem-vindo(a)!");
        router.push('/home');
    } catch (error) {
        console.error("Anonymous sign-in failed", error);
        toast.error("Não foi possível entrar como visitante.");
    } finally {
        setIsGuestLoading(false);
    }
  }

  return (
    <div className="relative mx-auto h-[100dvh] max-w-sm overflow-hidden bg-card text-center shadow-2xl">
      {/* Hexagon Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10">
        <div className="h-[400px] w-[400px]">
        <svg viewBox="0 0 100 100" className="absolute w-full h-full" style={{filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'}}>
          <defs>
            <linearGradient id="hexGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor: 'rgba(255,255,255,0.6)', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: 'rgba(255,255,255,0.3)', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: 'rgba(255,255,255,0.1)', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <polygon 
            points="50 1 95 25 95 75 50 99 5 75 5 25" 
            fill="url(#hexGradient)"
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="1.5"
          />
        </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-8">
        <div />
        <div className="space-y-4">
          <Image
            src="/logo.svg"
            alt="Cuidja Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
          <h1 className="font-logo text-5xl">
            <span className="text-orange-500">Cuid</span>
            <span className="text-teal-400">ja</span>
          </h1>
          <p className="text-muted-foreground">
            Compre e venda no comércio local. <br /> Fortaleça sua comunidade.
          </p>
        </div>

        <div className="space-y-4">
          <Button size="lg" className="w-full" asChild>
            <Link href="/signup">Criar Conta</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full" asChild>
            <Link href="/login">Já tenho uma conta</Link>
          </Button>
          <Button
            variant="link"
            className="w-full"
            onClick={handleGuestSignIn}
            disabled={isGuestLoading}
          >
            {isGuestLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Explorar como visitante'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
