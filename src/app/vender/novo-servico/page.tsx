
'use client';

import Link from 'next/link';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

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
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadFile } from '@/lib/storage';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const MAX_IMAGES = 1;

const serviceSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  price: z.coerce.number().min(0, 'O valor não pode ser negativo.'),
  images: z
    .array(z.any())
    .min(1, 'Uma imagem é obrigatória.')
    .max(MAX_IMAGES, `Você pode enviar no máximo ${MAX_IMAGES} imagem.`),
  attendanceType: z.enum(['presencial', 'online', 'ambos'], { required_error: 'Selecione a forma de atendimento.'}),
});

export default function NewServicePage() {
  const router = useRouter();
  const { user, firestore, isUserLoading } = useFirebase();
  const [storeId, setStoreId] = React.useState<string | null>(null);
  const [isStoreLoading, setStoreLoading] = React.useState(true);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function fetchStoreId() {
      if (isUserLoading) return;
      if (!firestore || !user) {
        setStoreLoading(false);
        return;
      }
      setStoreLoading(true);
      const storesRef = collection(firestore, 'stores');
      const q = query(storesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setStoreId(querySnapshot.docs[0].id);
      } else {
        toast.error('Você precisa criar uma loja antes de anunciar.');
        router.push('/vender/loja');
      }
      setStoreLoading(false);
    }
    if (!isUserLoading) {
      fetchStoreId();
    }
  }, [firestore, user, isUserLoading, router]);

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      images: [],
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentImages = form.getValues('images');
    const totalImages = currentImages.length + files.length;

    if (totalImages > MAX_IMAGES) {
      toast.error(`Você só pode adicionar mais ${MAX_IMAGES - currentImages.length} imagem.`);
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
      toast.error('Você precisa ter uma loja para criar um anúncio.');
      return;
    }

    const isSubmitting = form.formState.isSubmitting;
    if (isSubmitting) return;

    try {
      toast.loading('Publicando anúncio de serviço...');
      const imageUrls = await Promise.all(
        values.images.map((file: File) => 
          uploadFile(file, `products/${storeId}`)
        )
      );

      const finalImageObjects = imageUrls.map(url => ({
        imageUrl: url,
        imageHint: 'professional service',
      }));

      await addDoc(collection(firestore, 'products'), {
        name: values.name,
        description: values.description,
        price: values.price,
        category: 'Serviços',
        type: 'SERVICE',
        attendanceType: values.attendanceType,
        images: finalImageObjects,
        storeId: storeId,
        sellerId: user.uid,
        addons: [],
        availability: 'available',
        createdAt: new Date().toISOString(),
      });
      
      toast.dismiss();
      toast.success(`O serviço "${values.name}" foi publicado com sucesso.`);
      router.push('/vender');

    } catch (error) {
      console.error('Error creating service:', error);
      toast.dismiss();
      toast.error('Não foi possível salvar o serviço. Tente novamente.');
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
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender/selecionar-tipo">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Anunciar Serviço</h1>
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
                    Foto do Serviço ({imagePreviews.length}/{MAX_IMAGES})
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
                    Uma foto que represente seu trabalho.
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
                    <Input placeholder="Ex: Aula de Violão para Iniciantes" {...field} />
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
                  <FormLabel>Descrição Curta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva seu serviço de forma clara e atrativa."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Inicial (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                     Pode ser uma taxa de visita ou contato. Se for 0, aparecerá como "A combinar".
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
                control={form.control}
                name="attendanceType"
                render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>Forma de Atendimento</FormLabel>
                    <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                    >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="presencial" /></FormControl>
                            <Label className="font-normal">Presencial</Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="online" /></FormControl>
                            <Label className="font-normal">Online</Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="ambos" /></FormControl>
                            <Label className="font-normal">Ambos</Label>
                        </FormItem>
                    </RadioGroup>
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
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...</>
                : `Publicar Serviço`}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
