'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useFormContext, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Image as ImageIcon,
  PlusCircle,
  Trash2,
  Loader2,
  X,
  Sparkles,
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { suggestCategory } from '@/ai/flows/suggest-category-flow';

const MAX_IMAGES = 3;

const addonSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.coerce.number().min(0, 'Preço deve ser positivo'),
});

const addonGroupSchema = z.object({
  id: z.string().optional(),
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
  images: z
    .any()
    .array()
    .min(1, 'Adicione pelo menos uma imagem.')
    .max(MAX_IMAGES, `Você pode adicionar no máximo ${MAX_IMAGES} imagens.`),
  addonGroups: z.array(addonGroupSchema).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const { user, firestore, isUserLoading, store, isStoreLoading } = useFirebase();
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
      images: [],
      addonGroups: [],
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/vender');
    } else if (!isStoreLoading && !store) {
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
            form.reset({
              ...productData,
              addonGroups: productData.addonGroups || [],
              images: productData.images || [],
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

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
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
      const currentImageCount = imageFields.length;
      const availableSlots = MAX_IMAGES - currentImageCount;

      if (files.length > availableSlots) {
        toast.error(
          `Você pode adicionar no máximo ${availableSlots} mais imagem(ns).`
        );
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
        toast.error(`A sugestão "${result.category}" não é uma categoria válida.`);
      }
    } catch (error) {
      console.error('Error suggesting category:', error);
      toast.error('Não foi possível sugerir uma categoria.');
    } finally {
      setIsSuggesting(false);
    }
  };

  async function onSubmit(values: ProductFormValues) {
    if (!firestore || !user || !store) {
      toast.error('É necessário ter uma loja para criar um anúncio.');
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
        uploadFile(file, `products/${user.uid}/${Date.now()}-${file.name}`)
      );
      const newImageUrls = await Promise.all(uploadPromises);
      const newImageObjects = newImageUrls.map((url) => ({
        imageUrl: url,
        imageHint: 'product photo',
      }));

      const finalImageObjects = [...existingImageObjects, ...newImageObjects];

      if (finalImageObjects.length === 0) {
        form.setError('images', {
          type: 'manual',
          message: 'Adicione pelo menos uma imagem.',
        });
        setIsSubmitting(false);
        return;
      }

      const dataToSave = {
        ...values,
        price: Number(values.price),
        images: finalImageObjects,
        addonGroups: values.addonGroups?.map((group) => ({
          ...group,
          id: group.id || `${Date.now()}-${Math.random()}`,
        })) || [],
        storeId: store.id,
        sellerId: user.uid,
        type: 'PRODUCT' as const,
      };

      if (isEditing && productId) {
        const docRef = doc(firestore, 'products', productId);
        await updateDoc(docRef, { ...dataToSave, updatedAt: serverTimestamp() });
        toast.success('Produto atualizado com sucesso!');
      } else {
        await addDoc(collection(firestore, 'products'), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
        toast.success('Produto publicado com sucesso!');
      }

      router.push('/vender/produtos');
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

            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Imagens do Produto</FormLabel>
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

            <Separator />

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disponibilidade</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
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
                    Isso define se o cliente pode comprar na hora ou se precisa
                    encomendar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div>
              <Label className="text-base">Complementos</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Ofereça extras como borda recheada, mais queijo, etc.
              </p>
              <div className="space-y-4">
                {addonGroupFields.map((group, groupIndex) => (
                  <AddonGroupForm
                    key={group.id}
                    groupIndex={groupIndex}
                    removeAddonGroup={removeAddonGroup}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() =>
                  appendAddonGroup({
                    title: '',
                    type: 'single',
                    addons: [{ name: '', price: 0 }],
                  })
                }
              >
                <PlusCircle className="mr-2" /> Adicionar Grupo de Complementos
              </Button>
            </div>

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
    </div>
  );
}

function AddonGroupForm({
  groupIndex,
  removeAddonGroup,
}: {
  groupIndex: number;
  removeAddonGroup: (index: number) => void;
}) {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `addonGroups.${groupIndex}.addons`,
  });

  return (
    <div className="relative space-y-4 rounded-lg border p-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
        onClick={() => removeAddonGroup(groupIndex)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <FormField
        control={control}
        name={`addonGroups.${groupIndex}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título do Grupo</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Borda" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`addonGroups.${groupIndex}.type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Seleção</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex gap-4"
              >
                <FormItem className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id={`single-${groupIndex}`} />
                  <Label htmlFor={`single-${groupIndex}`}>Única Escolha</Label>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <RadioGroupItem value="multiple" id={`multiple-${groupIndex}`} />
                  <Label htmlFor={`multiple-${groupIndex}`}>Múltipla Escolha</Label>
                </FormItem>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
      <div>
        <Label>Opções</Label>
        <div className="mt-2 space-y-2">
          {fields.map((addon, addonIndex) => (
            <div key={addon.id} className="flex items-end gap-2">
              <FormField
                control={control}
                name={`addonGroups.${groupIndex}.addons.${addonIndex}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder="Ex: Catupiry" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`addonGroups.${groupIndex}.addons.${addonIndex}.price`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        placeholder="Preço"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(addonIndex)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => append({ name: '', price: 0 })}
        >
          Adicionar Opção
        </Button>
      </div>
    </div>
  );
}
