'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

const phoneSchema = z.object({
  phone: z.string().min(10, 'Número de telefone inválido.'),
});

const codeSchema = z.object({
  code: z.string().min(6, 'O código deve ter 6 dígitos.'),
});

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const { auth } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  // State for phone auth
  const [phone, setPhone] = useState('');
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const emailForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const setupRecaptcha = () => {
    if (!auth) return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
        }
      );
    }
  };

  useEffect(() => {
    // This effect should only run once on the client
    if (typeof window !== 'undefined') {
      setupRecaptcha();
    }
  }, [auth]);

  async function onEmailSubmit(values: z.infer<typeof loginSchema>) {
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
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
        ) {
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

  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    if (!auth || !window.recaptchaVerifier) return;
    setIsPhoneLoading(true);
    try {
      const result = await signInWithPhoneNumber(
        auth,
        values.phone,
        window.recaptchaVerifier
      );
      setConfirmationResult(result);
      setPhone(values.phone);
      toast({
        title: 'Código enviado!',
        description: `Enviamos um código para ${values.phone}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Falha ao enviar código',
        description:
          'Não foi possível enviar o código. Verifique o número e tente novamente.',
      });
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(values.code);
      toast({
        title: 'Login realizado com sucesso!',
      });
      router.push('/perfil');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'O código inserido está incorreto.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center bg-transparent p-6 shadow-2xl">
      <div id="recaptcha-container"></div>
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl">Bem-vindo(a)</h1>
        <p className="text-muted-foreground">Faça login para continuar</p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="phone">Telefone</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Login com E-mail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
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
        </TabsContent>
        <TabsContent value="phone">
          <Card>
            <CardHeader>
              <CardTitle>Login com Telefone</CardTitle>
            </CardHeader>
            <CardContent>
              {!confirmationResult ? (
                <Form {...phoneForm}>
                  <form
                    onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+55 (XX) XXXXX-XXXX"
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
                      disabled={isPhoneLoading}
                    >
                      {isPhoneLoading ? 'Enviando...' : 'Enviar Código'}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...codeForm}>
                  <form
                    onSubmit={codeForm.handleSubmit(onCodeSubmit)}
                    className="space-y-4"
                  >
                     <p className="text-sm text-center text-muted-foreground">
                        Enviamos um código para {phone}.
                    </p>
                    <FormField
                      control={codeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código de Verificação</FormLabel>
                          <FormControl>
                            <Input placeholder="XXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Verificando...' : 'Verificar e Entrar'}
                    </Button>
                     <Button variant="link" size="sm" onClick={() => setConfirmationResult(null)} className="w-full">
                        Usar outro número
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem uma conta?{' '}
        <Button variant="link" asChild className="h-auto p-0">
          <Link href="/signup">Cadastre-se</Link>
        </Button>
      </p>
    </div>
  );
}
    