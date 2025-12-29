'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirebase } from '@/firebase';
import { Product, ImagePlaceholder } from '@/lib/data';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import BottomNav from '@/components/layout/BottomNav';
import { uploadFile } from '@/lib/storage';
import { logger } from '@/lib/logger';

const imageFileSchema = z.instanceof(File).refine(file => file.size < 2 * 1024 * 1024, {
  message: 'A imagem deve ser menor que 2MB.',
}).refine(file => file.type.startsWith('image/'), {
  message: 'Formato de arquivo inválido.',
});

const imageSchema = z.union([imageFileSchema, z.object({ imageUrl: z.string(), imageHint: z.string() })]);

const serviceSchema = z.object({
  name: z.string().min(3, 'O nome do serviço é obrigatório.'),
  description: z.string().min(10, 'A descrição é obrigatória.').optional(),
  price: z.coerce.number().min(0, 'O preço deve ser 0 (a combinar) ou maior.'),
  images: z.array(imageSchema).max(3, 'Você pode enviar no máximo 3 imagens.').optional(),
  attendanceType: z.enum(['presencial', 'online', 'ambos'], {
    required_error: 'Selecione o tipo de atendimento.',
  }),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  serviceId?: string;
}

export function ServiceForm({ serviceId }: ServiceFormProps) {
  const { user, firestore, isUserLoading, store, isStoreLoading } =
    useFirebase();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(!!serviceId);

  const isEditing = !!serviceId;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      images: [],
    },
  });

  const imagesValue = form.watch('images') || [];

  useEffect(() => {
    if (isUserLoading || isStoreLoading) return;
    if (!user) {
      router.push('/login?redirect=/vender');
    } else if (!store) {
      router.push('/vender/loja');
    }
  }, [isUserLoading, user, isStoreLoading, store, router]);

  useEffect(() => {
    if (isEditing && firestore && serviceId) {
      const fetchService = async () => {
        setIsPageLoading(true);
        const docRef = doc(firestore, 'products', serviceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const serviceData = docSnap.data() as Product;
          form.reset({
            ...serviceData,
            name: serviceData.name || '',
            description: serviceData.description || '',
            price: serviceData.price || 0,
            images: serviceData.images || [],
            attendanceType: serviceData.attendanceType || undefined,
          });
        } else {
          toast.error('Serviço não encontrado.');
          router.push('/vender/servicos');
        }
        setIsPageLoading(false);
      };
      fetchService();
    }
  }, [firestore, serviceId, form, router, isEditing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const currentImages = form.getValues('images') || [];
        const totalImages = currentImages.length + files.length;
        
        if (totalImages > 3) {
            toast.error("Você pode selecionar no máximo 3 imagens.");
            return;
        }

        const newImages = [...currentImages, ...files];
        form.setValue('images', newImages, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = form.getValues('images') || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue('images', newImages, { shouldDirty: true, shouldValidate: true });
  };


  async function onSubmit(values: ServiceFormValues) {
    if (!firestore || !user?.uid || !store) {
      toast.error('É necessário estar autenticado e ter uma loja para criar um anúncio.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const uploadedImageUrls: ImagePlaceholder[] = [];
        
      for (const image of values.images || []) {
          if (image instanceof File) {
              const filePath = `products/${user.uid}/${Date.now()}_${image.name}`;
              logger.upload.start({ fileName: image.name, path: filePath });
              const url = await uploadFile(image, filePath);
              uploadedImageUrls.push({ imageUrl: url, imageHint: 'service photo' });
          } else {
              uploadedImageUrls.push(image);
          }
      }

      const dataToSave = {
        ...values,
        images: uploadedImageUrls,
        description: values.description || '',
        price: Number(values.price),
        storeId: store.id,
        sellerId: user.uid,
        type: 'SERVICE' as const,
        category: 'Serviços',
        availability: 'on_demand' as const,
      };

      if (isEditing && serviceId) {
        const docRef = doc(firestore, 'products', serviceId);
        await updateDoc(docRef, { ...dataToSave, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(firestore, 'products'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
      }

      const storeRef = doc(firestore, 'stores', store.id);
      await updateDoc(storeRef, {
          categories: arrayUnion('Serviços')
      });
      
      toast.success(isEditing ? 'Serviço atualizado com sucesso!' : 'Serviço publicado com sucesso!');
      router.push('/vender/servicos');
      router.refresh();

    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Não foi possível salvar o serviço. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isUserLoading || isStoreLoading || isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={isEditing ? '/vender/servicos' : '/vender/novo-anuncio'}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aula de Violão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Serviço</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que você faz, sua experiência e o que está incluso."
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagens (até 3)</FormLabel>
                  <FormControl>
                    <div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {imagesValue.map((img, index) => (
                          <div key={index} className="relative aspect-square">
                            <Image
                              src={img instanceof File ? URL.createObjectURL(img) : img.imageUrl}
                              alt={`Prévia da imagem ${index + 1}`}
                              fill
                              className="rounded-md object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-80 transition-opacity hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {imagesValue.length < 3 && (
                          <label
                            htmlFor="image-upload"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 hover:bg-gray-50 aspect-square"
                          >
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                            <p className="mt-1 text-xs text-center text-gray-500">
                              Adicionar
                            </p>
                          </label>
                        )}
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/png, image/jpeg"
                        multiple
                        onChange={handleImageChange}
                        disabled={imagesValue.length >= 3}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Deixe 0 para "A combinar".</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="attendanceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Atendimento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing
                ? 'Salvar Alterações'
                : 'Publicar Serviço'}
            </Button>
          </form>
        </Form>
      </main>
      <BottomNav />
    </div>
  );
}
