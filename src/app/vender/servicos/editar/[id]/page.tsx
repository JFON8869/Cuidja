'use client';

import Link from 'next/link';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const MAX_IMAGES = 3;

const serviceSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  images: z
    .array(z.any())
    .min(1, 'Pelo menos uma imagem é obrigatória.')
    .max(MAX_IMAGES, `Você pode enviar no máximo ${MAX_IMAGES} imagens.`),
});

export default function EditServicePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { firestore, user } = useFirebase();

  const [isLoading, setIsLoading] = React.useState(true);
  const [serviceName, setServiceName] = React.useState('');
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      images: [],
    },
  });

  React.useEffect(() => {
    if (!firestore || !id || !user) return;

    const serviceRef = doc(firestore, 'services', id as string);
    getDoc(serviceRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const service = docSnap.data();
          // Assuming a 'sellerId' field exists on the service document for ownership check
          if (service.sellerId !== user.uid) {
            toast({
              variant: 'destructive',
              title: 'Acesso Negado',
              description: 'Você não tem permissão para editar este serviço.',
            });
            router.push('/vender');
            return;
          }

          form.reset({
            name: service.name,
            description: service.description || '',
            images: service.images, // assuming images are stored with URLs
          });
          setServiceName(service.name);
          setImagePreviews(
            service.images.map((img: { imageUrl: string }) => img.imageUrl)
          );
        } else {
          toast({ variant: 'destructive', title: 'Serviço não encontrado' });
          router.push('/vender/servicos');
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, firestore, user, form, router, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentImages = form.getValues('images') || [];
    const currentPreviews = imagePreviews;
    const totalImages = currentPreviews.length + files.length;

    if (totalImages > MAX_IMAGES) {
      toast({
        variant: 'destructive',
        title: 'Limite de imagens excedido',
        description: `Você só pode adicionar mais ${MAX_IMAGES - currentPreviews.length} imagens.`,
      });
      return;
    }

    const newImagePreviews = files.map((file) => URL.createObjectURL(file));
    form.setValue('images', [...currentImages, ...files], {
      shouldValidate: true,
    });
    setImagePreviews((prev) => [...prev, ...newImagePreviews]);
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues('images');
    const currentPreviews = [...imagePreviews];

    currentImages.splice(index, 1);
    currentPreviews.splice(index, 1);

    form.setValue('images', currentImages, { shouldValidate: true });
    setImagePreviews(currentPreviews);
  };

  async function onSubmit(values: z.infer<typeof serviceSchema>) {
    if (!firestore || !id) return;

    // TODO: Implement image upload logic.
    // For now, we'll just update the text fields.
    const serviceRef = doc(firestore, 'services', id as string);

    try {
      await updateDoc(serviceRef, {
        name: values.name,
        description: values.description,
        // images: newImageUrls would be updated here after upload
      });

      toast({
        title: 'Serviço atualizado!',
        description: `O serviço "${values.name}" foi atualizado com sucesso.`,
      });

      router.push('/vender/servicos');
    } catch (error) {
      console.error('Error updating service: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações. Tente novamente.',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="flex items-center border-b p-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="mx-auto h-6 w-48" />
          <div className="w-10"></div>
        </header>
        <main className="flex-1 space-y-6 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender/servicos">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto truncate px-2 font-headline text-xl">
          Editar: {serviceName}
        </h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Fotos do Serviço ({imagePreviews.length}/{MAX_IMAGES})
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={src}
                            alt={`Preview ${index}`}
                            fill
                            className="rounded-md object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {imagePreviews.length < MAX_IMAGES && (
                        <div
                          className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card text-muted-foreground transition hover:bg-muted"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageChange}
                          />
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8" />
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Use fotos de trabalhos já feitos como portfólio.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Instalação Elétrica Residencial" {...field} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os detalhes do seu serviço..."
                      className="resize-none"
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
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? 'Salvando...'
                : 'Salvar Alterações'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
