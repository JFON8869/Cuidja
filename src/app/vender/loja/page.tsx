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

const dayHoursSchema = z.object({
  isOpen: z.boolean(),
  open: z.string(),
  close: z.string(),
});

const storeSchema = z.object({
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
}).refine(
  (data) => {
    if (data.operatingHours) {
      for (const day of Object.values(data.operatingHours)) {
        if (day.isOpen && (!day.open || !day.close)) {
          return false; // Invalid if open but times are missing
        }
      }
    }
    return true;
  },
  {
    message:
      'Horários de abertura e fechamento são obrigatórios para dias marcados como abertos.',
    path: ['operatingHours'],
  }
);

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
  const { user, firestore, isUserLoading, store: existingStore } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isUserLoading) return;
    if (!user) {
      router.push('/login?redirect=/vender');
      return;
    }

    if (existingStore) {
        form.reset({
          ...existingStore,
          logoUrl: existingStore.logoUrl || null,
          operatingHours:
            existingStore.operatingHours || getDefaultOperatingHours(),
        });
    }
    setIsLoading(false);
  }, [user, isUserLoading, existingStore, router, form]);

  const onSubmit = async (values: StoreFormValues) => {
    if (!user || !firestore) {
      toast.error("Você precisa estar logado para salvar.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let finalLogoUrl = existingStore?.logoUrl || "";

      // Step 1: Handle file upload if a new file is present
      if (values.logoUrl instanceof File) {
        const filePath = `logos/${user.uid}/${Date.now()}_${values.logoUrl.name}`;
        finalLogoUrl = await uploadFile(values.logoUrl, filePath);
      } else if (values.logoUrl === null) {
          finalLogoUrl = ""; // Handle logo deletion
      }

      // Step 2: Prepare data for Firestore
      const dataToSave = {
        ...values,
        logoUrl: finalLogoUrl,
        userId: user.uid,
      };

      // Step 3: Save data to Firestore
      if (existingStore) {
        // Update existing store
        const storeRef = doc(firestore, 'stores', existingStore.id);
        await updateDoc(storeRef, dataToSave);
        toast.success('Loja atualizada com sucesso!');
      } else {
        // Create new store (seller activation)
        const newStoreRef = doc(collection(firestore, 'stores'));
        const newStoreData = {
            ...dataToSave,
            id: newStoreRef.id,
            categories: [], // Initialize with empty categories
            createdAt: serverTimestamp(),
        };
        await setDoc(newStoreRef, newStoreData);
        toast.success('Sua loja foi criada! Agora você pode começar a vender.');
      }
      
      router.push('/vender');
      router.refresh(); // Force refresh to get new store data in context

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

  const getPreviewUrl = () => {
    if (logoValue instanceof File) {
      return URL.createObjectURL(logoValue);
    }
    if (typeof logoValue === 'string') {
      return logoValue;
    }
    return null;
  };

  const previewUrl = getPreviewUrl();


  if (isLoading || isUserLoading) {
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
                <CardTitle>
                  {existingStore ? 'Atualize os dados' : 'Informações da Loja'}
                </CardTitle>
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
                  render={({ field }) => (
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
                                      form.setValue('logoUrl', null, { shouldDirty: true });
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
      <BottomNav />
    </div>
  );
}
