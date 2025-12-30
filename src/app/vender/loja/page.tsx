'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
  addDoc,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Clock, ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OperatingHoursForm } from '@/components/vender/OperatingHoursForm';
import { uploadFile } from '@/lib/storage';
import BottomNav from '@/components/layout/BottomNav';
import { logger } from '@/lib/logger';

const dayHoursSchema = z.object({
  isOpen: z.boolean(),
  open: z.string(),
  close: z.string(),
});

const storeSchema = z
  .object({
    name: z.string().min(3, 'O nome da loja é obrigatório.'),
    address: z.string().min(10, 'O endereço é obrigatório.'),
    logoUrl: z.any().optional(),
    operatingHours: z
      .object({
        sun: dayHoursSchema,
        mon: dayHoursSchema,
        tue: dayHoursSchema,
        wed: dayHoursSchema,
        thu: dayHoursSchema,
        fri: dayHoursSchema,
        sat: dayHoursSchema,
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.operatingHours) {
      for (const dayKey in data.operatingHours) {
        const day =
          data.operatingHours[dayKey as keyof typeof data.operatingHours];
        if (day.isOpen && (!day.open || !day.close)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [`operatingHours.${dayKey}.open`],
            message: 'Horários são obrigatórios para dias abertos.',
          });
        }
      }
    }
  });

type StoreFormValues = z.infer<typeof storeSchema>;

// Helper to generate default hours for a new store
const getDefaultOperatingHours = () => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const hours: any = {};
  days.forEach((day) => {
    hours[day] = { isOpen: day !== 'sun', open: '09:00', close: '18:00' };
  });
  return hours;
};

export default function StoreFormPage() {
  const {
    user,
    firestore,
    isUserLoading,
    store: existingStore,
    isStoreLoading,
  } = useFirebase();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      address: '',
      logoUrl: null,
      operatingHours: getDefaultOperatingHours(),
    },
  });

  const logoValue = form.watch('logoUrl');

  useEffect(() => {
    if (isUserLoading || isStoreLoading) return;
    if (!user) {
      router.push('/login?redirect=/vender');
    }
  }, [user, isUserLoading, isStoreLoading, router]);

  useEffect(() => {
    if (existingStore) {
      form.reset({
        name: existingStore.name || '',
        address: existingStore.address || '',
        logoUrl: existingStore.logoUrl || null,
        operatingHours:
          existingStore.operatingHours || getDefaultOperatingHours(),
      });
    }
  }, [existingStore, form]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (logoValue instanceof File) {
      objectUrl = URL.createObjectURL(logoValue);
      setPreviewUrl(objectUrl);
    } else if (typeof logoValue === 'string') {
      setPreviewUrl(logoValue);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [logoValue]);

 const onSubmit = async (values: StoreFormValues) => {
    if (!user?.uid || !firestore) {
      toast.error('Você precisa estar logado para salvar.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let finalLogoUrl = existingStore?.logoUrl || '';
      const logoFile = values.logoUrl;

      if (logoFile instanceof File) {
        const filePath = `logos/${user.uid}/${Date.now()}_${logoFile.name}`;
        logger.upload.start({ fileName: logoFile.name, path: filePath });
        try {
            finalLogoUrl = await uploadFile(logoFile, filePath);
            logger.upload.success({ fileName: logoFile.name, url: finalLogoUrl });
        } catch (uploadError) {
             logger.upload.error({fileName: logoFile.name, error: uploadError});
             toast.error("Falha no upload da imagem. Tente novamente.");
             setIsSubmitting(false); // Stop execution if upload fails
             return; 
        }
      } else if (logoValue === null) {
        finalLogoUrl = '';
      }

      const dataToSave = {
        ...values,
        logoUrl: finalLogoUrl,
        userId: user.uid,
      };

      if (existingStore) {
        const storeRef = doc(firestore, 'stores', existingStore.id);
        await updateDoc(storeRef, dataToSave);
        toast.success('Loja atualizada com sucesso!');
      } else {
        const batch = writeBatch(firestore);
        const newStoreRef = doc(collection(firestore, 'stores'));
        const newStorePayload = {
          ...dataToSave,
          categories: [],
          createdAt: serverTimestamp(),
        };
        batch.set(newStoreRef, newStorePayload);
        const userDocRef = doc(firestore, 'users', user.uid);
        batch.update(userDocRef, { storeId: newStoreRef.id });
        await batch.commit();
        toast.success('Sua loja foi criada!');
      }

      router.push('/vender');
      router.refresh();
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error('Erro ao salvar os dados da loja.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem (PNG, JPG).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem é muito grande. O tamanho máximo é 2MB.');
        return;
      }
      form.setValue('logoUrl', file, { shouldDirty: true });
    }
  };

  if (isUserLoading || (isStoreLoading && !existingStore)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="flex items-center border-b p-4">
        {existingStore && (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/vender">
              <ArrowLeft />
            </Link>
          </Button>
        )}
        <h1 className="mx-auto font-headline text-xl">
          {existingStore ? 'Editar Loja' : 'Ative sua Conta de Vendedor'}
        </h1>
        {/* Spacer to keep title centered */}
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Loja</CardTitle>
                <CardDescription>
                  {existingStore
                    ? 'Mantenha as informações da sua loja sempre atualizadas.'
                    : 'Este é o primeiro passo para começar a vender. Capriche!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={() => (
                    <FormItem>
                      <FormLabel>Logo da Loja</FormLabel>
                      <FormControl>
                        <div>
                          <label
                            htmlFor="logo-upload"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:bg-gray-50"
                          >
                            {previewUrl ? (
                              <div className="relative">
                                <Image
                                  src={previewUrl}
                                  alt="Prévia da logo"
                                  width={100}
                                  height={100}
                                  className="h-24 w-24 rounded-md object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    form.setValue('logoUrl', null, {
                                      shouldDirty: true,
                                    });
                                  }}
                                  className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-80 transition-opacity hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm font-medium text-primary">
                                  Clique para enviar uma imagem
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  PNG, JPG (MAX. 2MB)
                                </p>
                              </div>
                            )}
                          </label>
                          <Input
                            id="logo-upload"
                            type="file"
                            className="sr-only"
                            accept="image/png, image/jpeg"
                            onChange={handleLogoChange}
                          />
                        </div>
                      </FormControl>
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
                        <Input placeholder="Ex: Cantinho da Vovó" {...field} />
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
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Rua, número, bairro e cidade"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horários de Funcionamento
                </CardTitle>
                <CardDescription>
                  Selecione os dias e horários em que sua loja está aberta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OperatingHoursForm />
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {existingStore ? 'Salvar Alterações' : 'Criar Loja e Ativar Conta'}
            </Button>
          </form>
        </Form>
      </main>
      {existingStore && <BottomNav />}
    </div>
  );
}
