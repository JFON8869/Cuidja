
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Image as ImageIcon,
  PlusCircle,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
import { mockCategories } from '@/lib/data';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const addonSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.coerce.number().min(0, 'Preço deve ser positivo'),
});

const addonGroupSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  type: z.enum(['single', 'multiple']),
  addons: z.array(addonSchema).min(1, 'Adicione pelo menos um complemento'),
});

const productSchema = z.object({
  name: z.string().min(3, 'O nome do produto é obrigatório.'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'O preço deve ser 0 ou maior.'),
  category: z.string({ required_error: 'Selecione uma categoria.' }),
  availability: z.enum(['available', 'on_demand', 'unavailable']),
  images: z.any().array().min(1, 'Adicione pelo menos uma imagem.'),
  addonGroups: z.array(addonGroupSchema).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

function NewProductPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      availability: 'available',
      images: [],
      addonGroups: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const {
    fields: addonGroupFields,
    append: appendAddonGroup,
    remove: removeAddonGroup,
  } = useFieldArray({
    control: form.control,
    name: 'addonGroups',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const existingNames = fields.map((field: any) => field.name);
      
      files.forEach(file => {
          if (existingNames.includes(file.name)) {
              toast.error(`A imagem "${file.name}" já foi adicionada.`);
          } else {
              append(file);
          }
      });
    }
  };

  const removeImage = (index: number) => {
    remove(index);
  };
  
  if (!isUserLoading && !user) {
    router.push('/login?redirect=/vender');
    return null;
  }

  if (!storeId) {
    toast.error('ID da loja é necessário para criar um anúncio.');
    router.push('/vender');
    return null;
  }

  async function onSubmit(values: ProductFormValues) {
    if (!firestore || !user) {
      toast.error('Erro de autenticação. Faça login novamente.');
      return;
    }

    try {
      const imageUrls = await Promise.all(
        values.images.map(image => {
          if (image instanceof File) {
            return uploadFile(image, `products/${user.uid}`);
          }
          return Promise.resolve(image.imageUrl); // Should not happen in create flow
        })
      );
      
      const finalImageObjects = imageUrls.map(url => ({
        imageUrl: url,
        imageHint: 'product photo' 
      }));


      await addDoc(collection(firestore, 'products'), {
        ...values,
        images: finalImageObjects,
        storeId: storeId,
        sellerId: user.uid,
        type: 'PRODUCT',
        createdAt: serverTimestamp(),
      });

      toast.success('Produto publicado com sucesso!');
      router.push('/vender');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Não foi possível salvar o produto. Tente novamente.');
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/vender/novo-anuncio?storeId=${storeId}`}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Novo Produto</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Info */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Bolo de Fubá com Goiabada" {...field} />
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
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {mockCategories.filter(c => c.type === 'PRODUCT').map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Detalhes que ajudam o cliente a escolher seu produto." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

            {/* Images */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagens do Produto</FormLabel>
                  <FormControl>
                    <div className="rounded-lg border border-dashed p-6 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <label
                        htmlFor="file-upload"
                        className="mt-2 block text-sm font-medium text-primary hover:underline cursor-pointer"
                      >
                        <span>Clique para enviar</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, GIF até 10MB</p>
                    </div>
                  </FormControl>
                   <FormMessage />
                  {fields.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="relative group">
                          <Image
                            src={URL.createObjectURL(field as any)}
                            alt={`Preview ${index}`}
                            width={100}
                            height={100}
                            className="h-24 w-24 rounded-md object-cover"
                          />
                           <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-80 group-hover:opacity-100 transition-opacity"
                           >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Availability */}
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disponibilidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Como este produto estará disponível?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Pronta entrega</SelectItem>
                      <SelectItem value="on_demand">Sob encomenda</SelectItem>
                      <SelectItem value="unavailable">Indisponível</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Isso define se o cliente pode comprar na hora ou se precisa encomendar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Publicando anúncio...' : 'Publicar Anúncio'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}

export default function NewProductPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>}>
            <NewProductPage />
        </Suspense>
    )
}
