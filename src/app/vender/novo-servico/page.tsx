'use client';

import Link from 'next/link';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

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
  visitFee: z.coerce
    .number({
      required_error: 'A taxa de visita é obrigatória.',
      invalid_type_error: 'A taxa de visita deve ser um número.',
    })
    .min(10, 'A taxa de visita mínima é de R$ 10,00.'),
});

export default function NewServicePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, firestore, isUserLoading } = useFirebase();
  const [storeId, setStoreId] = React.useState<string | null>(null);
  const [isStoreLoading, setStoreLoading] = React.useState(true);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function fetchStoreId() {
      if (!firestore || !user) {
        if (!isUserLoading) setStoreLoading(false);
        return;
      }
      setStoreLoading(true);
      const storesRef = collection(firestore, 'stores');
      const q = query(storesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setStoreId(querySnapshot.docs[0].id);
      } else {
        toast({
          variant: 'destructive',
          title: 'Nenhuma loja encontrada',
          description:
            'Você precisa criar uma loja antes de anunciar serviços.',
        });
        router.push('/vender/loja');
      }
      setStoreLoading(false);
    }

    fetchStoreId();
  }, [firestore, user, isUserLoading, router, toast]);

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      images: [],
      visitFee: 10,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentImages = form.getValues('images');
    const totalImages = currentImages.length + files.length;

    if (totalImages > MAX_IMAGES) {
      toast({
        variant: 'destructive',
        title: 'Limite de imagens excedido',
        description: `Você só pode adicionar mais ${MAX_IMAGES - currentImages.length} imagens.`,
      });
      return;
    }

    const newImageFiles = [...currentImages, ...files];
    form.setValue('images', newImageFiles, { shouldValidate: true });

    const newImagePreviews = files.map((file) => URL.createObjectURL(file));
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
    if (!firestore || !user || !storeId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível identificar a loja ou o usuário.',
      });
      return;
    }

    // TODO: Implement actual image upload to Firebase Storage
    const imageUrls = imagePreviews.map((preview, i) => ({
      imageUrl: preview,
      imageHint: "service portfolio",
    }));

    try {
      const servicesCollection = collection(firestore, 'services');
      await addDoc(servicesCollection, {
        name: values.name,
        description: values.description,
        images: imageUrls,
        providerId: storeId,
        sellerId: user.uid, // Denormalize sellerId for security rules
        category: 'Serviços',
        visitFee: values.visitFee,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Serviço anunciado!',
        description: `O serviço "${values.name}" foi cadastrado com sucesso.`,
      });

      router.push('/vender');
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao anunciar serviço',
        description: 'Não foi possível salvar o serviço. Tente novamente.',
      });
    }
  }

  if (isUserLoading || isStoreLoading) {
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
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Anunciar Novo Serviço</h1>
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
                      placeholder="Descreva os detalhes do seu serviço, sua experiência, etc..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="visitFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa de Visita/Contato (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="10.00"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O valor mínimo para a taxa de visita ou contato é de R$ 10,00.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={form.formState.isSubmitting || isStoreLoading}
            >
              {form.formState.isSubmitting
                ? 'Anunciando...'
                : 'Anunciar Serviço'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
