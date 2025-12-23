'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
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
import { Store } from '@/lib/data';
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
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
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

    const fetchStore = async () => {
      if (!firestore || !user) return;
      setIsLoading(true);
      const q = query(
        collection(firestore, 'stores'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const storeDoc = querySnapshot.docs[0];
        const storeData = { id: storeDoc.id, ...storeDoc.data() } as Store;
        setStore(storeData);
        form.reset({
          ...storeData,
          operatingHours:
            storeData.operatingHours || getDefaultOperatingHours(),
        });
      }
      setIsLoading(false);
    };
    fetchStore();
  }, [user, firestore, isUserLoading, router, form]);

  const onSubmit = async (values: StoreFormValues) => {
    if (!user || !firestore) return;
    
    setIsSubmitting(true);
    try {
      let finalLogoUrl = store?.logoUrl || '';

      if (values.logoUrl && values.logoUrl instanceof File) {
        finalLogoUrl = await uploadFile(values.logoUrl, `logos/${user.uid}`);
      } else if (values.logoUrl === null) {
        finalLogoUrl = ''; // Handle case where logo is removed
      }

      const dataToSave = { 
          ...values,
          logoUrl: finalLogoUrl,
       };

      if (store) {
        const storeRef = doc(firestore, 'stores', store.id);
        await updateDoc(storeRef, dataToSave);
        toast.success('Loja atualizada com sucesso!');
      } else {
        const newStoreRef = doc(collection(firestore, 'stores'));
        const newStore = {
          ...dataToSave,
          id: newStoreRef.id,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };
        await setDoc(newStoreRef, newStore);
        toast.success('Sua loja foi criada!');
      }
      router.push('/vender');
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
      form.setValue('logoUrl', file);
    }
  };


  if (isLoading || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-12 shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          {store ? 'Editar Loja' : 'Criar Sua Loja'}
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {store ? 'Atualize os dados' : 'Informações da Loja'}
                </CardTitle>
                <CardDescription>
                  {store
                    ? 'Mantenha as informações da sua loja sempre atualizadas.'
                    : 'Estes são os dados que seus clientes verão. Capriche!'}
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
                            {logoValue ? (
                              <div className="relative">
                                <Image
                                  src={
                                    logoValue instanceof File
                                      ? URL.createObjectURL(logoValue)
                                      : logoValue
                                  }
                                  alt="Prévia da logo"
                                  width={100}
                                  height={100}
                                  className="h-24 w-24 rounded-md object-cover"
                                />
                                 <button
                                  type="button"
                                  onClick={(e) => {
                                      e.preventDefault();
                                      form.setValue('logoUrl', null);
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
              {store ? 'Salvar Alterações' : 'Criar Loja e Ir para o Painel'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
