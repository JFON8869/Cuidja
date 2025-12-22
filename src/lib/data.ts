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
  { id: '1', name: 'Restaurantes', slug: 'restaurantes', Icon: Utensils, color: 'bg-orange-400' },
  { id: '2', name: 'Bebidas', slug: 'bebidas', Icon: GlassWater, color: 'bg-blue-400' },
  { id: '3', name: 'Faça-Feira', slug: 'faca-feira', Icon: ShoppingBasket, color: 'bg-green-500' },
  { id: '4', name: 'Artesanatos', slug: 'artesanatos', Icon: Brush, color: 'bg-purple-400' },
  { id: '5', name: 'Gás e Água', slug: 'gas-e-agua', Icon: Droplets, color: 'bg-sky-400' },
  { id: '6', name: 'Pets', slug: 'pets', Icon: Dog, color: 'bg-yellow-600' },
  { id: '7', name: 'Farmácias', slug: 'farmacias', Icon: Pill, color: 'bg-red-400' },
  { id: '8', name: 'Serviços', slug: 'servicos', Icon: Wrench, color: 'bg-gray-500' },
];

export const mockProducts: Product[] = [
  // Faça-Feira
  {
    id: '1',
    name: 'Cesta de Orgânicos',
    description: 'Uma seleção fresquinha de vegetais e legumes orgânicos, colhidos direto da horta para a sua mesa.',
    price: 85.5,
    seller: 'Sítio Verde',
    imageId: 'vegetables',
    image: findImage('vegetables'),
    category: 'Faça-Feira',
  },
  {
    id: '2',
    name: 'Pão Artesanal',
    description: 'Pão de fermentação natural, com casca crocante e miolo macio. Feito com muito carinho.',
    price: 15.0,
    seller: 'Pão da Terra',
    imageId: 'bread',
    image: findImage('bread'),
    category: 'Faça-Feira',
  },
  {
    id: '3',
    name: 'Mel Silvestre',
    description: 'Mel puro e delicioso, produzido por abelhas que se alimentam de flores silvestres da nossa região.',
    price: 30.0,
    seller: 'Apiário do Sol',
    imageId: 'honey',
    image: findImage('honey'),
    category: 'Faça-Feira',
  },
  {
    id: '6',
    name: 'Tomates Frescos (kg)',
    description: 'Tomates maduros e suculentos, cultivados sem agrotóxicos. Ideais para saladas e molhos.',
    price: 12.0,
    seller: 'Sítio Verde',
    imageId: 'tomatoes',
    image: findImage('tomatoes'),
    category: 'Faça-Feira',
  },
  {
    id: '7',
    name: 'Queijo Minas Frescal',
    description: 'Queijo fresco, leve e saboroso, produzido com leite puro da fazenda. Ótimo para o café da manhã.',
    price: 45.0,
    seller: 'Laticínios da Serra',
    imageId: 'cheese',
    image: findImage('cheese'),
    category: 'Faça-Feira',
  },
  // Artesanatos
  {
    id: '4',
    name: 'Vaso de Cerâmica',
    description: 'Vaso de cerâmica feito à mão por artesãos locais. Cada peça é única e perfeita para suas plantas.',
    price: 50.0,
    seller: 'Arte em Barro',
    imageId: 'pottery',
    image: findImage('pottery'),
    category: 'Artesanatos',
  },
  {
    id: '8',
    name: 'Pano de Prato Bordado',
    description: 'Pano de prato de alta qualidade, com lindos bordados feitos à mão. Uma peça que une utilidade e beleza.',
    price: 25.0,
    seller: 'Bordados Finos',
    imageId: 'textiles',
    image: findImage('textiles'),
    category: 'Artesanatos',
  },
  // Serviços
  {
    id: '10',
    name: 'Serviço de Jardinagem',
    description: 'Deixe seu jardim mais bonito com nosso serviço de jardinagem. Cuidamos de tudo para você.',
    price: 120.0,
    seller: 'João Jardineiro',
    imageId: 'woodworking', // using as placeholder
    image: findImage('woodworking'),
    category: 'Serviços',
  },
  // Restaurantes
  {
    id: '11',
    name: 'Pizza Margherita Grande',
    description: 'A clássica pizza Margherita com molho de tomate fresco, mussarela de búfala e manjericão.',
    price: 55.0,
    seller: 'Pizza Bella',
    imageId: 'vegetables', // placeholder
    image: findImage('vegetables'),
    category: 'Restaurantes',
  },
  {
    id: '12',
    name: 'Hambúrguer Artesanal',
    description: 'Delicioso hambúrguer de 180g, queijo cheddar, bacon crocante e pão brioche.',
    price: 35.0,
    seller: 'Burger House',
    imageId: 'bread', // placeholder
    image: findImage('bread'),
    category: 'Restaurantes',
  },
  // Bebidas
  {
    id: '13',
    name: 'Suco Natural de Laranja (1L)',
    description: 'Suco de laranja feito na hora, sem adição de açúcar ou conservantes. Pura vitamina C.',
    price: 18.0,
    seller: 'Sucos & Cia',
    imageId: 'fruits',
    image: findImage('fruits'),
    category: 'Bebidas',
  },
  // Gás e Água
  {
    id: '14',
    name: 'Botijão de Gás P13',
    description: 'Botijão de gás de cozinha de 13kg. Entrega rápida e segura em sua casa.',
    price: 110.0,
    seller: 'Gás Rápido',
    imageId: 'category-gas-water',
    image: findImage('category-gas-water'),
    category: 'Gás e Água',
  },
  // Pets
  {
    id: '15',
    name: 'Ração para Cães Adultos (15kg)',
    description: 'Alimento completo e balanceado para cães adultos de todas as raças.',
    price: 150.0,
    seller: 'Pet Amigo',
    imageId: 'category-pets',
    image: findImage('category-pets'),
    category: 'Pets',
  },
  // Farmácias
  {
    id: '16',
    name: 'Analgésico 10 Comprimidos',
    description: 'Medicamento analgésico e antitérmico para alívio de dores e febre.',
    price: 15.0,
    seller: 'Farmácia Bem-Estar',
    imageId: 'category-pharmacy',
    image: findImage('category-pharmacy'),
    category: 'Farmácias',
  },
];
