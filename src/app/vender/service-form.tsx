'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
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
import { uploadFile } from '@/lib/storage';
import { Product } from '@/lib/data';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const MAX_IMAGES = 3;

const serviceSchema = z.object({
  name: z.string().min(3, 'O nome do serviço é obrigatório.'),
  description: z.string().min(10, 'A descrição é obrigatória.').optional(),
  price: z.coerce.number().min(0, 'O preço deve ser 0 (a combinar) ou maior.'),
  attendanceType: z.enum(['presencial', 'online', 'ambos'], {
    required_error: 'Selecione o tipo de atendimento.',
  }),
  images: z
    .any()
    .array()
    .min(1, 'Adicione pelo menos uma imagem.')
    .max(MAX_IMAGES, `Você pode adicionar no máximo ${MAX_IMAGES} imagens.`),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  serviceId?: string;
}

export function ServiceForm({ serviceId }: ServiceFormProps) {
  const { user, firestore, isUserLoading, store, isStoreLoading } = useFirebase();
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

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: 'images',
  });
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/vender');
    } else if (!isStoreLoading && !store) {
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
          form.reset(docSnap.data() as Product);
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
      const currentImageCount = imageFields.length;
      const availableSlots = MAX_IMAGES - currentImageCount;

      if (files.length > availableSlots) {
        toast.error(`Você pode adicionar no máximo ${availableSlots} mais imagem(ns).`);
        return;
      }

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`"${file.name}" não é uma imagem válida.`);
          continue;
        }
        if (file.size > 2 * 1024 * 1024) {
          toast.error(`A imagem "${file.name}" é muito grande (max 2MB).`);
          continue;
        }
        appendImage(file);
      }
    }
  };

  async function onSubmit(values: ServiceFormValues) {
    if (!firestore || !user || !store) {
      toast.error('Erro de autenticação ou loja não encontrada.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newImageFiles = values.images.filter(
        (image: any): image is File => image instanceof File
      );
      const existingImageObjects = values.images.filter(
        (image: any) =>
          typeof image === 'object' && image.imageUrl && !(image instanceof File)
      );

      const uploadPromises = newImageFiles.map((file) =>
        uploadFile(file, `services/${user.uid}/${Date.now()}-${file.name}`)
      );
      const newImageUrls = await Promise.all(uploadPromises);
      const newImageObjects = newImageUrls.map((url) => ({
        imageUrl: url,
        imageHint: 'professional service',
      }));

      const finalImageObjects = [...existingImageObjects, ...newImageObjects];

      if (finalImageObjects.length === 0) {
        form.setError('images', {
          type: 'manual',
          message: 'Adicione pelo menos uma imagem.',
        });
        throw new Error('Nenhuma imagem fornecida.');
      }
      
      const dataToSave = {
        name: values.name,
        description: values.description || '',
        price: Number(values.price),
        attendanceType: values.attendanceType,
        images: finalImageObjects,
        storeId: store.id,
        sellerId: user.uid,
        type: 'SERVICE' as const,
        category: 'Serviços',
        availability: 'on_demand' as const,
      };

      if (isEditing && serviceId) {
        const docRef = doc(firestore, 'products', serviceId);
        await updateDoc(docRef, {...dataToSave, updatedAt: serverTimestamp()});
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await addDoc(collection(firestore, 'products'), {...dataToSave, createdAt: serverTimestamp()});
        toast.success('Serviço publicado com sucesso!');
      }

      router.push('/vender/servicos');
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
              render={() => (
                <FormItem>
                  <FormLabel>Imagens do Serviço</FormLabel>
                  <FormDescription>
                    Adicione fotos do seu trabalho ou que representem o serviço.
                  </FormDescription>
                  <FormControl>
                    <div className="rounded-lg border border-dashed p-6 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <label
                        htmlFor="file-upload"
                        className={`mt-2 block text-sm font-medium text-primary ${
                          imageFields.length >= MAX_IMAGES
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer hover:underline'
                        }`}
                      >
                        <span>
                          {imageFields.length >= MAX_IMAGES
                            ? 'Limite de imagens atingido'
                            : 'Clique para enviar'}
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleImageChange}
                          accept="image/*"
                          disabled={imageFields.length >= MAX_IMAGES}
                        />
                      </label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG até 2MB. Máximo de {MAX_IMAGES} imagens.
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {imageFields.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {imageFields.map((field, index) => {
                        const src =
                          field instanceof File
                            ? URL.createObjectURL(field)
                            : (field as any)?.imageUrl;
                        if (!src) return null;
                        return (
                          <div
                            key={field.id}
                            className="group relative aspect-square h-auto w-full"
                          >
                            <Image
                              src={src}
                              alt={`Preview ${index}`}
                              fill
                              sizes="(max-width: 640px) 33vw, 100px"
                              className="rounded-md object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-80 transition-opacity group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
              {isSubmitting ? 'Publicando...' : (isEditing ? 'Salvar Alterações' : 'Publicar Serviço')}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
