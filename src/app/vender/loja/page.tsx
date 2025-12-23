'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { OperatingHoursForm } from '@/components/vender/OperatingHoursForm';
import { Separator } from '@/components/ui/separator';
import { Store } from '@/lib/data';
import { uploadFile } from '@/lib/storage';
import { Textarea } from '@/components/ui/textarea';

const storeSchema = z.object({
  name: z.string().min(3, 'O nome da loja deve ter pelo menos 3 caracteres.'),
  logo: z.any().optional(),
  address: z.string().min(5, 'O endereço é obrigatório.'),
});

export default function StoreManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFinalizing = searchParams.get('finalizing') === 'true';

  const { user, firestore, isUserLoading } = useFirebase();
  const [store, setStore] = React.useState<Store | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  const isEditing = !!store;

  React.useEffect(() => {
    async function fetchStore() {
      if (!firestore || !user) {
        if (!isUserLoading) setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const storesRef = collection(firestore, 'stores');
      const q = query(storesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const storeDoc = querySnapshot.docs[0];
        const storeData = {
          id: storeDoc.id,
          ...storeDoc.data(),
        } as Store;
        setStore(storeData);
        form.reset({
          name: storeData.name,
          address: storeData.address || '',
        });
        if (storeData.logoUrl) {
          setLogoPreview(storeData.logoUrl);
          form.setValue('logo', storeData.logoUrl);
        }
      }
      setIsLoading(false);
    }
    fetchStore();
  }, [user, firestore, isUserLoading, form]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    form.setValue('logo', file, { shouldValidate: true });
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    form.setValue('logo', null, { shouldValidate: true });
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof storeSchema>) {
    if (!firestore || !user) {
      toast.error('Erro de autenticação.');
      return;
    }

    form.formState.isSubmitting;
    let logoUrl = store?.logoUrl || null;

    try {
        if (values.logo && values.logo instanceof File) {
            toast.loading('Enviando logo...');
            logoUrl = await uploadFile(values.logo, `stores/${user.uid}/logos`);
            toast.dismiss();
        } else if (!values.logo) {
            logoUrl = null;
        }

        const storeData = {
            name: values.name,
            logoUrl: logoUrl,
            address: values.address,
            userId: user.uid,
        };

        if (isEditing && store) {
            const storeRef = doc(firestore, 'stores', store.id);
            await updateDoc(storeRef, storeData);
            toast.success('Loja atualizada com sucesso!');
            router.push('/vender');
        } else {
            const docRef = await addDoc(collection(firestore, 'stores'), {
              ...storeData,
              createdAt: new Date().toISOString(),
            });
            toast.success('Loja criada com sucesso!');
            if (isFinalizing) {
                 toast.info('Agora publique seu primeiro anúncio!');
                 const pendingProduct = sessionStorage.getItem('pendingProduct');
                 if (pendingProduct) {
                     sessionStorage.removeItem('pendingProduct');
                     router.push('/vender/novo-produto'); // Or pass data
                 } else {
                    router.push('/vender/selecionar-tipo');
                 }
            } else {
                router.push('/vender');
            }
        }
        router.refresh(); 

    } catch (error) {
        console.error('Error saving store:', error);
        toast.dismiss();
        toast.error('Não foi possível salvar os dados da loja. Tente novamente.');
    }
  }

  if (isLoading || isUserLoading) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="flex items-center border-b p-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="mx-auto h-6 w-48" />
          <div className="w-10"></div>
        </header>
        <main className="flex-1 space-y-6 p-4">
          <Skeleton className="mx-auto h-32 w-32 rounded-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          {isEditing ? 'Editar Minha Loja' : 'Finalize sua Loja'}
        </h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
       {isFinalizing && !isEditing && (
         <div className="mb-6 rounded-lg border border-accent/50 bg-accent/10 p-4 text-center text-accent-foreground">
            <p className="font-semibold">Último passo!</p>
            <p className="text-sm">Preencha os dados da sua loja para que seu anúncio seja publicado e você possa começar a vender.</p>
         </div>
       )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="logo"
              render={() => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>Logo da Loja</FormLabel>
                  <FormControl>
                    <div
                      className="relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50 bg-card text-muted-foreground transition hover:bg-muted"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {logoPreview ? (
                        <>
                          <Image
                            src={logoPreview}
                            alt="Preview da logo"
                            fill
                            className="rounded-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -right-1 -top-1 z-10 h-7 w-7 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLogo();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-10 w-10" />
                          <p className="mt-1 text-xs">Enviar foto</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Clique para enviar a logo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Loja</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sítio Verde" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço / Base de Atuação</FormLabel>
                  <FormControl>
                    <Textarea placeholder="O endereço principal da sua loja ou a área que você atende." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEditing ? 'Salvar Alterações' : 'Salvar e Publicar Anúncio'}
            </Button>
          </form>
        </Form>
        {isEditing && store && (
          <>
            <Separator className="my-8" />
            <OperatingHoursForm store={store} />
          </>
        )}
      </main>
    </div>
  );
}
