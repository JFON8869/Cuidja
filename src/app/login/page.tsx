'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirebase } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export default function LoginPage() {
  const { auth } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Login realizado com sucesso!',
      });
      router.push('/perfil');
    } catch (error) {
      console.error(error);
      let description = 'Ocorreu um erro ao tentar fazer login.';
      if (error instanceof FirebaseError) {
         if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'E-mail ou senha incorretos.';
         }
      }
      toast({
        variant: 'destructive',
        title: 'Falha no login',
        description,
      });
    } finally {
        setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: 'Login com Google realizado com sucesso!',
      });
      router.push('/perfil');
    } catch (error) {
      console.error(error);
       toast({
        variant: 'destructive',
        title: 'Falha no login com Google',
        description: 'Não foi possível fazer login com o Google.',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center bg-transparent p-6 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl">Bem-vindo(a)</h1>
        <p className="text-muted-foreground">Faça login para continuar</p>
      </div>

      <div className="grid gap-6">
         <Button variant="outline" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
            {isGoogleLoading ? 'Entrando...' : 'Entrar com Google'}
        </Button>
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-muted px-2 text-muted-foreground">Ou continue com</span>
            </div>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                    <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="Sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar com E-mail'}
            </Button>
            </form>
        </Form>
        <p className="mt-2 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/signup">Cadastre-se</Link>
            </Button>
        </p>
      </div>
    </div>
  );
}
