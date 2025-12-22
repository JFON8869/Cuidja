'use client';

import Link from 'next/link';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Upload,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mockCategories } from '@/lib/data';
import { useProductContext } from '@/context/ProductContext';
import { type ImagePlaceholder } from '@/lib/placeholder-images';

const MAX_IMAGES = 3;

const productSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    description: z
      .string()
      .min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
    price: z.coerce.number().positive('O preço deve ser um número positivo.'),
    category: z
      .string({ required_error: 'Selecione uma categoria.' })
      .min(1, 'Selecione uma categoria.'),
    availability: z.enum(['immediate', 'on_demand', 'scheduled']),
    preparationTime: z.string().optional(),
    availableFrom: z.date().optional(),
    images: z
      .array(z.any())
      .min(1, 'Pelo menos uma imagem é obrigatória.')
      .max(MAX_IMAGES, `Você pode enviar no máximo ${MAX_IMAGES} imagens.`),
  })
  .refine(
    (data) => {
      if (data.availability === 'on_demand' && !data.preparationTime) {
        return false;
      }
      return true;
    },
    {
      message: 'O tempo de preparo é obrigatório para encomendas.',
      path: ['preparationTime'],
    }
  )
  .refine(
    (data) => {
      if (data.availability === 'scheduled' && !data.availableFrom) {
        return false;
      }
      return true;
    },
    {
      message: 'A data de disponibilidade é obrigatória.',
      path: ['availableFrom'],
    }
  );

export default function NewProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { addProduct } = useProductContext();
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      availability: 'immediate',
      preparationTime: '',
      images: [],
    },
  });

  const availability = form.watch('availability');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentImages = form.getValues('images');
    const totalImages = currentImages.length + files.length;

    if (totalImages > MAX_IMAGES) {
      toast({
        variant: 'destructive',
        title: 'Limite de imagens excedido',
        description: `Você só pode adicionar mais ${
          MAX_IMAGES - currentImages.length
        } imagens.`,
      });
      return;
    }

    const newImageFiles = [...currentImages, ...files];
    form.setValue('images', newImageFiles);

    const newImagePreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newImagePreviews]);
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues('images');
    const currentPreviews = [...imagePreviews];

    currentImages.splice(index, 1);
    currentPreviews.splice(index, 1);

    form.setValue('images', currentImages);
    setImagePreviews(currentPreviews);
  };

  function onSubmit(values: z.infer<typeof productSchema>) {
    const newImages: ImagePlaceholder[] = imagePreviews.map((preview, i) => ({
      id: `custom-${new Date().getTime()}-${i}`,
      description: values.name,
      imageUrl: preview,
      imageHint: values.category.toLowerCase(),
    }));

    const newProduct = {
      id: new Date().getTime().toString(),
      name: values.name,
      price: values.price,
      seller: 'Meu Negócio', // Mock seller
      description: values.description,
      category: values.category,
      images: newImages,
    };

    // @ts-ignore
    addProduct(newProduct);

    toast({
      title: 'Produto anunciado!',
      description: `O produto "${values.name}" foi cadastrado com sucesso.`,
    });

    router.push('/vender/produtos');
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Anunciar Novo Produto</h1>
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
                    defaultValue={field.value}
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

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Disponibilidade</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="immediate" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Pronta-entrega
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="on_demand" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Por Encomenda
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="scheduled" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Disponível a partir de
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {availability === 'on_demand' && (
              <FormField
                control={form.control}
                name="preparationTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de Preparo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 3 dias úteis" {...field} />
                    </FormControl>
                    <FormDescription>
                      Informe o tempo necessário para produzir o item.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {availability === 'scheduled' && (
              <FormField
                control={form.control}
                name="availableFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Disponibilidade</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      O produto só aparecerá para os clientes a partir desta
                      data.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
              Anunciar Produto
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
