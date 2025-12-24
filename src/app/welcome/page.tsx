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
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col justify-between bg-card p-8 text-center shadow-2xl">
      <div/>
      <div className="space-y-4">
        <Image src="/logo.svg" alt="Cuidja Logo" width={80} height={80} className="mx-auto" />
        <h1 className="font-logo text-5xl">
          <span className="text-orange-500">Cuid</span><span className="text-teal-400">ja</span>
        </h1>
        <p className="text-muted-foreground">
          Compre e venda no comércio local. <br/> Fortaleça sua comunidade.
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
          {isGuestLoading ? <Loader2 className="animate-spin" /> : "Explorar como visitante"}
        </Button>
      </div>
    </div>
  );
}
