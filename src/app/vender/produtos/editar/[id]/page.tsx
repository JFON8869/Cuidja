'use client';

import Link from 'next/link';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Upload,
  X,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockCategories } from '@/lib/data';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const MAX_IMAGES = 3;

const productSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
    price: z.coerce.number().positive('O preço deve ser um número positivo.'),
    category: z.string({ required_error: 'Selecione uma categoria.' }).min(1, 'Selecione uma categoria.'),
    images: z.array(z.any()).min(1, 'Pelo menos uma imagem é obrigatória.').max(MAX_IMAGES, `Você pode enviar no máximo ${MAX_IMAGES} imagens.`),
  });

export default function EditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { firestore, user } = useFirebase();

  const [isLoading, setIsLoading] = React.useState(true);
  const [productName, setProductName] = React.useState('');
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

  React.useEffect(() => {
    if (!firestore || !id || !user) return;
    
    const productRef = doc(firestore, 'products', id as string);
    getDoc(productRef).then(docSnap => {
        if (docSnap.exists()) {
            const product = docSnap.data();
            if (product.sellerId !== user.uid) {
                toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Você não tem permissão para editar este produto.' });
                router.push('/vender');
                return;
            }

            form.reset({
                name: product.name,
                description: product.description || '',
                price: product.price,
                category: product.category,
                images: product.images,
            });
            setProductName(product.name);
            setImagePreviews(product.images.map((img: { imageUrl: string }) => img.imageUrl));
        } else {
            toast({ variant: 'destructive', title: 'Produto não encontrado' });
            router.push('/vender/produtos');
        }
    }).finally(() => setIsLoading(false));
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

    // Apenas para preview, os arquivos reais seriam tratados no upload
    const newImagePreviews = files.map((file) => URL.createObjectURL(file));
    
    // Armazena os arquivos para o RHF e os previews para a UI
    form.setValue('images', [...currentImages, ...files], { shouldValidate: true });
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

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (!firestore || !id) return;
    
    // TODO: Implement image upload logic.
    // This requires uploading new files and keeping old URLs.
    // For now, we'll just update the text fields.
    const productRef = doc(firestore, "products", id as string);

    try {
        await updateDoc(productRef, {
            name: values.name,
            description: values.description,
            price: values.price,
            category: values.category,
            // images: newImageUrls // This would be the new array of image URLs after upload
        });

        toast({
          title: 'Produto atualizado!',
          description: `O produto "${values.name}" foi atualizado com sucesso.`,
        });

        router.push('/vender/produtos');
    } catch (error) {
        console.error("Error updating product: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao atualizar",
            description: "Não foi possível salvar as alterações. Tente novamente."
        })
    }
  }

  if (isLoading) {
    return (
        <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
            <header className="flex items-center border-b p-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-6 w-48 mx-auto" />
                <div className="w-10"></div>
            </header>
            <main className="flex-1 p-4 space-y-6">
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
          <Link href="/vender/produtos">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl truncate px-2">Editar: {productName}</h1>
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
                  <FormLabel>Fotos do Produto ({imagePreviews.length}/{MAX_IMAGES})</FormLabel>
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
                    Envie até {MAX_IMAGES} fotos do seu produto.
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
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pão Artesanal" {...field} />
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
                      placeholder="Descreva os detalhes do seu produto..."
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
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 15.50"
                      {...field}
                    />
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
