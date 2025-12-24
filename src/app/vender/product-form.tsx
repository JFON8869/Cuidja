'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import {
  collection,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  addDoc,
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
import { Product } from '@/lib/data';
import { productCategories } from '@/lib/categories';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { suggestCategory } from '@/ai/flows/suggest-category-flow';
import BottomNav from '@/components/layout/BottomNav';
import { Switch } from '@/components/ui/switch';


const productSchema = z.object({
  name: z.string().min(3, 'O nome do produto é obrigatório.'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'O preço deve ser 0 ou maior.'),
  category: z.string({ required_error: 'Selecione uma categoria.' }),
  availability: z.enum(['available', 'unavailable']),
});


type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const { user, firestore, auth, isUserLoading, store, isStoreLoading } =
    useFirebase();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(!!productId);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const isEditing = !!productId;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      availability: 'available',
    },
  });

  useEffect(() => {
    if (isUserLoading || isStoreLoading) return;
    if (!user) {
      router.push('/login?redirect=/vender');
    } else if (!store) {
      router.push('/vender/loja');
    }
  }, [isUserLoading, user, isStoreLoading, store, router]);

  useEffect(() => {
    if (isEditing && firestore && productId) {
      const fetchProduct = async () => {
        setIsPageLoading(true);
        try {
          const docRef = doc(firestore, 'products', productId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const productData = docSnap.data() as Product;
            // The 'availability' field in the DB can be 'on_demand', but our form only supports 'available' or 'unavailable'.
            // We map 'on_demand' to 'available' for the form's logic.
            const availability = productData.availability === 'unavailable' ? 'unavailable' : 'available';

            form.reset({
              ...productData,
              name: productData.name || '',
              description: productData.description || '',
              price: productData.price || 0,
              category: productData.category || '',
              availability,
            });
          } else {
            toast.error('Produto não encontrado.');
            router.push('/vender/produtos');
          }
        } catch (error) {
          toast.error('Erro ao carregar o produto.');
          console.error(error);
        } finally {
          setIsPageLoading(false);
        }
      };
      fetchProduct();
    }
  }, [firestore, productId, form, router, isEditing]);

  const handleSuggestCategory = async () => {
    const name = form.getValues('name');
    const description = form.getValues('description');

    if (!name.trim()) {
      toast.error(
        'Por favor, insira um nome para o produto antes de sugerir uma categoria.'
      );
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestCategory({
        productName: name,
        productDescription: description || '',
      });
      const validCategory = productCategories.find(
        (c) => c.name === result.category
      );
      if (validCategory) {
        form.setValue('category', result.category, { shouldValidate: true });
        toast.success(`Categoria sugerida: ${result.category}`);
      } else {
        toast.error(
          `A sugestão "${result.category}" não é uma categoria válida.`
        );
      }
    } catch (error) {
      console.error('Error suggesting category:', error);
      toast.error('Não foi possível sugerir uma categoria.');
    } finally {
      setIsSuggesting(false);
    }
  };

  async function onSubmit(values: ProductFormValues) {
    if (!firestore || !auth?.currentUser || !store) {
      toast.error('É necessário estar autenticado e ter uma loja para criar um anúncio.');
      return;
    }

    const uid = auth.currentUser.uid;
    if (!uid) {
        toast.error('Não foi possível verificar sua identidade. Faça login novamente.');
        return;
    }

    setIsSubmitting(true);

    try {
        const dataToSave = {
            ...values,
            description: values.description || '',
            price: Number(values.price),
            storeId: store.id,
            sellerId: uid,
            type: 'PRODUCT' as const,
            addons: [], //TODO: Implement addon management
        };
        
        if (isEditing && productId) {
            const productRef = doc(firestore, 'products', productId);
            await updateDoc(productRef, { ...dataToSave, updatedAt: serverTimestamp() });
        } else {
            await addDoc(collection(firestore, 'products'), {
              ...dataToSave,
              createdAt: serverTimestamp(),
            });
        }

        // Atomically add the product's category to the store's list of categories
        const storeRef = doc(firestore, 'stores', store.id);
        await updateDoc(storeRef, {
            categories: arrayUnion(values.category)
        });

        toast.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto publicado com sucesso!');
        router.push('/vender/produtos');
        router.refresh();

    } catch (error) {
        console.error('Error saving product:', error);
        toast.error('Não foi possível salvar o produto. Tente novamente.');
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isUserLoading || isStoreLoading || isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={isEditing ? '/vender/produtos' : '/vender/novo-anuncio'}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Bolo de Fubá com Goiabada"
                      {...field}
                    />
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
                      placeholder="Detalhes que ajudam o cliente a escolher seu produto."
                      {...field}
                    />
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
                    <div className="mb-2 flex items-center justify-between">
                      <FormLabel>Categoria</FormLabel>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        onClick={handleSuggestCategory}
                        disabled={isSuggesting}
                      >
                        {isSuggesting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Sugerir
                      </Button>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            
             <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Disponível para venda</FormLabel>
                    <FormDescription>
                      Se desativado, o produto não aparecerá para os clientes.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'available'}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 'available' : 'unavailable')
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />


            <Separator />
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Salvar Alterações' : 'Publicar Anúncio'}
            </Button>
          </form>
        </FormProvider>
      </main>
      <BottomNav />
    </div>
  );
}
