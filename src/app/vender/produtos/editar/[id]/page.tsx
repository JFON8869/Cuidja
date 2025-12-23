'use client';

import Link from 'next/link';
import * as React from 'react';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockCategories, ImagePlaceholder } from '@/lib/data';
import { useFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { uploadFile } from '@/lib/storage';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

const MAX_IMAGES = 3;

const addonSchema = z.object({
  name: z.string().min(1, 'Nome do complemento é obrigatório.'),
  price: z.coerce.number().min(0, 'O preço não pode ser negativo.'),
});

const addonGroupSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Título do grupo é obrigatório.'),
  type: z.enum(['single', 'multiple'], { required_error: 'Selecione o tipo.'}),
  addons: z.array(addonSchema).min(1, 'Adicione pelo menos um complemento.'),
});

const existingImageSchema = z.object({
    imageUrl: z.string(),
    imageHint: z.string(),
});

const newImageSchema = z.any().refine(val => val instanceof File, "Deve ser um arquivo de imagem.");

const imageSchema = z.union([existingImageSchema, newImageSchema]);


const productSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  price: z.coerce.number().positive('O preço deve ser um número positivo.'),
  category: z
    .string({ required_error: 'Selecione uma categoria.' })
    .min(1, 'Selecione uma categoria.'),
  images: z
    .array(imageSchema)
    .min(1, 'Pelo menos uma imagem é obrigatória.')
    .max(MAX_IMAGES, `Você pode enviar no máximo ${MAX_IMAGES} imagens.`),
  addonGroups: z.array(addonGroupSchema).optional(),
  availability: z.string({ required_error: 'Selecione a disponibilidade.' }).default('available'),
});

type FormValues = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { firestore, user } = useFirebase();

  const [isLoading, setIsLoading] = React.useState(true);
  const [productName, setProductName] = React.useState('');
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      images: [],
      addonGroups: [],
      availability: 'available',
    },
  });

  const { fields: images, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images"
  });

  const { fields: addonGroups, append: appendAddonGroup, remove: removeAddonGroup } = useFieldArray({
    control: form.control,
    name: "addonGroups",
  });

  const selectedCategory = form.watch('category');
  const isService = selectedCategory === 'Serviços';


  React.useEffect(() => {
    if (!firestore || !id || !user) return;

    const productRef = doc(firestore, 'products', id as string);
    getDoc(productRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const product = docSnap.data();
          if (product.sellerId !== user.uid) {
            toast.error('Você não tem permissão para editar este produto.');
            router.push('/vender');
            return;
          }
          
          form.reset({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category,
            images: product.images || [], 
            addonGroups: product.addons || [],
            availability: product.availability || 'available',
          });
          setProductName(product.name);
        } else {
          toast.error('Produto não encontrado');
          router.push('/vender/produtos');
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, firestore, user, form, router]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentImageFiles = form.getValues('images').filter((img): img is File => img instanceof File);
    const currentImageNames = new Set(currentImageFiles.map(file => file.name));
  
    const validFiles = files.filter(file => {
      if (currentImageNames.has(file.name)) {
        toast.error(`A imagem "${file.name}" já foi adicionada.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
        return;
    }

    if (images.length + validFiles.length > (isService ? 1 : MAX_IMAGES)) {
      toast.error(`Você pode adicionar no máximo ${isService ? 1 : MAX_IMAGES - images.length} imagem(ns).`);
      return;
    }
    
    validFiles.forEach(file => appendImage(file));
  };
  
  async function onSubmit(values: FormValues) {
    if (!firestore || !id || !user) return;
    
    const isSubmitting = form.formState.isSubmitting;
    if (isSubmitting) return;

    const productRef = doc(firestore, 'products', id as string);
    
    try {
        toast.loading('Verificando e enviando imagens...');
        
        const uploadPromises = values.images.map((imageOrFile) => {
          if (imageOrFile instanceof File) {
            return uploadFile(imageOrFile, `products/${id as string}`);
          }
          return Promise.resolve(imageOrFile.imageUrl);
        });

        const imageUrls = await Promise.all(uploadPromises);

        const finalImages: ImagePlaceholder[] = imageUrls.map(url => {
          const originalImage = values.images.find(img => !(img instanceof File) && img.imageUrl === url);
          return {
            imageUrl: url,
            imageHint: originalImage?.imageHint || values.category.toLowerCase(),
          };
        });

        const finalAddonGroups = isService ? [] : values.addonGroups?.map(group => ({
            ...group,
            id: group.id || group.title.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
        }));

        const updateData = {
            name: values.name,
            description: values.description,
            price: values.price,
            category: values.category,
            addons: finalAddonGroups || [],
            images: finalImages,
            availability: values.availability,
        };

        await updateDoc(productRef, updateData)

        toast.dismiss();
        toast.success(`O item "${values.name}" foi atualizado com sucesso.`);
        router.push(isService ? '/vender/servicos' : '/vender/produtos');
        router.refresh();

    } catch (error) {
        toast.dismiss();
        console.error('Error during image upload or data preparation: ', error);
        
        const permissionError = new FirestorePermissionError({
          path: productRef.path,
          operation: 'update',
          requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
        
        toast.error('Não foi possível salvar as alterações. Verifique suas permissões e tente novamente.');
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
  
  const getImagePreviewUrl = (image: any): string => {
    if (image instanceof File) {
        return URL.createObjectURL(image);
    }
    return image.imageUrl;
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={isService ? "/vender/servicos" : "/vender/produtos"}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto truncate px-2 font-headline text-xl">
          Editar: {productName}
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
                    Fotos ({images.length}/{isService ? 1 : MAX_IMAGES})
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div key={image.id} className="relative aspect-square">
                          <Image
                            src={getImagePreviewUrl(form.getValues(`images.${index}`))}
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
                      {images.length < (isService ? 1 : MAX_IMAGES) && (
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
                    Envie até {isService ? 1 : MAX_IMAGES} foto(s).
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
                  <FormLabel>Nome do {isService ? 'Serviço' : 'Produto'}</FormLabel>
                  <FormControl>
                    <Input placeholder={isService ? "Ex: Aula de Violão" : "Ex: Pão Artesanal"} {...field} />
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
                      placeholder="Descreva os detalhes do seu item..."
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
                  <FormLabel>{isService ? 'Taxa de Visita/Contato (R$)' : 'Preço (R$)'}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 15.50"
                      {...field}
                    />
                  </FormControl>
                   {isService && <FormDescription>Se for 0, aparecerá como "A combinar".</FormDescription>}
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
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                   <span className="text-base text-muted-foreground">Configurações avançadas</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">

                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponibilidade</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a disponibilidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="available">Disponível (em estoque)</SelectItem>
                              <SelectItem value="on_demand">Sob Encomenda</SelectItem>
                              <SelectItem value="unavailable">Indisponível</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {!isService && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Complementos</h3>
                    {addonGroups.map((group, groupIndex) => (
                      <AddonGroupField key={group.id} groupIndex={groupIndex} removeGroup={removeAddonGroup} />
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAddonGroup({ title: '', type: 'single', addons: [{ name: '', price: 0 }]})}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar Grupo de Complementos
                    </Button>
                  </div>
                  )}

                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                : 'Salvar Alterações'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}

function AddonGroupField({ groupIndex, removeGroup }: { groupIndex: number, removeGroup: (index: number) => void}) {
  const { control } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `addonGroups.${groupIndex}.addons`
  });

  return (
    <div className="rounded-lg border p-4 space-y-4 relative">
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground"
            onClick={() => removeGroup(groupIndex)}
        >
            <X className="h-4 w-4" />
        </Button>
        
        <FormField
            control={control}
            name={`addonGroups.${groupIndex}.title`}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Título do Grupo</FormLabel>
                <FormControl>
                <Input placeholder="Ex: Tamanho da Pizza" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={control}
            name={`addonGroups.${groupIndex}.type`}
            render={({ field }) => (
            <FormItem className="space-y-3">
                <FormLabel>Tipo de Seleção</FormLabel>
                <FormControl>
                <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center gap-4"
                >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                            <RadioGroupItem value="single" />
                        </FormControl>
                        <FormLabel className="font-normal">Seleção Única</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                            <RadioGroupItem value="multiple" />
                        </FormControl>
                        <FormLabel className="font-normal">Múltipla Escolha</FormLabel>
                    </FormItem>
                </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <div className="space-y-2">
            <Label>Complementos</Label>
            {fields.map((addon, addonIndex) => (
                <div key={addon.id} className="flex items-center gap-2">
                    <FormField
                        control={control}
                        name={`addonGroups.${groupIndex}.addons.${addonIndex}.name`}
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                            <Input placeholder="Ex: Borda de Catupiry" {...field} />
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
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                                    <Input type="number" step="0.01" className="pl-7 w-28" placeholder="Preço" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(addonIndex)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
             <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ name: '', price: 0 })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Complemento
              </Button>
        </div>
    </div>
  );
}
