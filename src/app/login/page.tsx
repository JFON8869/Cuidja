'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { handleGoogleSignIn } from '@/lib/auth-actions';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});


export default function LoginPage() {
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);


  const emailForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });


  async function onEmailSubmit(values: z.infer<typeof loginSchema>) {
    if (!auth) return;
    setIsLoading(true);

    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(() => {
        toast.success('Login realizado com sucesso!');
        router.push('/home');
      })
      .catch((error) => {
        console.error(error);
        let description = 'Ocorreu um erro ao tentar fazer login.';
        if (error instanceof FirebaseError) {
          if (
            error.code === 'auth/user-not-found' ||
            error.code === 'auth/wrong-password' ||
            error.code === 'auth/invalid-credential'
          ) {
            description = 'E-mail ou senha incorretos.';
          }
        }
        toast.error(description);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const onGoogleSignIn = async () => {
    if (!auth || !firestore) {
      toast.error("Serviços de autenticação indisponíveis. Tente novamente.");
      return;
    }
    await handleGoogleSignIn(auth, firestore, router, toast, setGoogleLoading);
  };


  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center bg-transparent p-6 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl">Bem-vindo(a)</h1>
        <p className="text-muted-foreground">Faça login para continuar</p>
      </div>

       <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                variant="outline"
                onClick={onGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full"
              >
                {isGoogleLoading ? 'Entrando...' : 'Entrar com Google'}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
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
                    control={emailForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Sua senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar com E-mail'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem uma conta?{' '}
        <Button variant="link" asChild className="h-auto p-0">
          <Link href="/signup">Cadastre-se</Link>
        </Button>
      </p>
    </div>
  );
}
