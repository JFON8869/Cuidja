import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';
import type { LucideIcon } from 'lucide-react';
import {
  Utensils,
  GlassWater,
  ShoppingBasket,
  Brush,
  Droplets,
  Dog,
  Pill,
  Wrench,
} from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  seller: string;
  imageId: string;
  image: ImagePlaceholder;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  Icon: LucideIcon;
  color: string;
}

const findImage = (id: string): ImagePlaceholder => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    // Fallback to a default image if not found
    const defaultImage = PlaceHolderImages.find((img) => img.id === 'vegetables');
    if (!defaultImage) throw new Error("Default placeholder image not found.");
    return defaultImage
  }
  return image;
};

export const mockCategories: Category[] = [
  { id: '1', name: 'Restaurantes', slug: 'restaurantes', Icon: Utensils, color: 'text-orange-500' },
  { id: '2', name: 'Bebidas', slug: 'bebidas', Icon: GlassWater, color: 'text-blue-500' },
  { id: '3', name: 'Faça-Feira', slug: 'faca-feira', Icon: ShoppingBasket, color: 'text-green-600' },
  { id: '4', name: 'Artesanatos', slug: 'artesanatos', Icon: Brush, color: 'text-purple-500' },
  { id: '5', name: 'Gás e Água', slug: 'gas-e-agua', Icon: Droplets, color: 'text-sky-500' },
  { id: '6', name: 'Pets', slug: 'pets', Icon: Dog, color: 'text-yellow-700' },
  { id: '7', name: 'Farmácias', slug: 'farmacias', Icon: Pill, color: 'text-red-500' },
  { id: '8', name: 'Serviços', slug: 'servicos', Icon: Wrench, color: 'text-gray-600' },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Cesta de Orgânicos',
    description: 'Uma seleção fresquinha de vegetais e legumes orgânicos, colhidos direto da horta para a sua mesa. Perfeito para uma alimentação saudável e cheia de sabor.',
    price: 85.5,
    seller: 'Sítio Verde',
    imageId: 'vegetables',
    image: findImage('vegetables'),
    category: 'Faça-Feira',
  },
  {
    id: '2',
    name: 'Pão Artesanal',
    description: 'Pão de fermentação natural, com casca crocante e miolo macio. Feito com ingredientes selecionados e muito carinho, ideal para qualquer hora do dia.',
    price: 15.0,
    seller: 'Pão da Terra',
    imageId: 'bread',
    image: findImage('bread'),
    category: 'Faça-Feira',
  },
  {
    id: '3',
    name: 'Mel Silvestre',
    description: 'Mel puro e delicioso, produzido por abelhas que se alimentam de flores silvestres da nossa região. Um adoçante natural e cheio de benefícios para a saúde.',
    price: 30.0,
    seller: 'Apiário do Sol',
    imageId: 'honey',
    image: findImage('honey'),
    category: 'Faça-Feira',
  },
  {
    id: '4',
    name: 'Vaso de Cerâmica',
    description: 'Vaso de cerâmica feito à mão por artesãos locais. Cada peça é única e perfeita para dar um toque especial de decoração para suas plantas e para sua casa.',
    price: 50.0,
    seller: 'Arte em Barro',
    imageId: 'pottery',
    image: findImage('pottery'),
    category: 'Artesanatos',
  },
  {
    id: '5',
    name: 'Geleia de Morango',
    description: 'Geleia caseira feita com morangos frescos e selecionados. Sem conservantes, é a combinação perfeita para pães, torradas e iogurtes.',
    price: 22.0,
    seller: 'Quitutes da Vovó',
    imageId: 'jam',
    image: findImage('jam'),
    category: 'Faça-Feira',
  },
  {
    id: '6',
    name: 'Tomates Frescos (kg)',
    description: 'Tomates maduros e suculentos, cultivados sem agrotóxicos. Ideais para saladas, molhos e para dar mais cor e sabor aos seus pratos.',
    price: 12.0,
    seller: 'Sítio Verde',
    imageId: 'tomatoes',
    image: findImage('tomatoes'),
    category: 'Faça-Feira',
  },
  {
    id: '7',
    name: 'Queijo Minas Frescal',
    description: 'Queijo fresco, leve e saboroso, produzido com leite puro da fazenda. Ótimo para o café da manhã ou para um lanche rápido e saudável.',
    price: 45.0,
    seller: 'Laticínios da Serra',
    imageId: 'cheese',
    image: findImage('cheese'),
    category: 'Faça-Feira',
  },
  {
    id: '8',
    name: 'Pano de Prato Bordado',
    description: 'Pano de prato de alta qualidade, com lindos bordados feitos à mão. Uma peça que une utilidade e beleza para alegrar sua cozinha.',
    price: 25.0,
    seller: 'Bordados Finos',
    imageId: 'textiles',
    image: findImage('textiles'),
    category: 'Artesanatos',
  },
  {
    id: '9',
    name: 'Cenouras Orgânicas',
    description: 'Cenouras doces e crocantes, cultivadas de forma orgânica para garantir o máximo de nutrientes e sabor. Perfeitas para sucos, saladas e bolos.',
    price: 8.0,
    seller: 'Horta Feliz',
    imageId: 'carrots',
    image: findImage('carrots'),
    category: 'Faça-Feira',
  },
    {
    id: '10',
    name: 'Serviço de Jardinagem',
    description: 'Deixe seu jardim mais bonito e bem cuidado com nosso serviço de jardinagem. Cuidamos de tudo, desde o plantio até a manutenção, para você ter um espaço verde impecável.',
    price: 120.0,
    seller: 'João Jardineiro',
    imageId: 'woodworking', // using as placeholder
    image: findImage('woodworking'),
    category: 'Serviços',
  },
];
