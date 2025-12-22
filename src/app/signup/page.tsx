'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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

const signupSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  terms: z.boolean().default(false).refine(val => val === true, {
    message: 'Você deve aceitar os termos e a política de privacidade.'
  })
});

export default function SignupPage() {
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    if (!auth || !firestore) return;
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.name,
      });

      // Create a user document in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        name: values.name,
        email: values.email,
      });

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você já pode fazer login.',
      });
      router.push('/login');

    } catch (error) {
      console.error(error);
      let description = 'Ocorreu um erro ao criar sua conta.';
      if (error instanceof FirebaseError) {
         if (error.code === 'auth/email-already-in-use') {
            description = 'Este e-mail já está em uso.';
         }
      }
      toast({
        variant: 'destructive',
        title: 'Falha no cadastro',
        description,
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center bg-transparent p-6 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl">Crie sua Conta</h1>
        <p className="text-muted-foreground">É rápido e fácil.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <Input type="password" placeholder="Crie uma senha forte" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                 <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Li e concordo com os termos e políticas de privacidade.
                  </FormLabel>
                   <p className="text-sm text-muted-foreground">
                    Leia nossos{' '}
                    <Link href="/termos/comprador" className="underline hover:text-primary">Termos de Uso</Link> e nossa{' '}
                    <Link href="/termos/privacidade" className="underline hover:text-primary">Política de Privacidade</Link>.
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">Faça login</Link>
        </Button>
      </p>
    </div>
  );
}
