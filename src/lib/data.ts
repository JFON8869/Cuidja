
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
  images: ImagePlaceholder[];
  category: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  Icon: LucideIcon;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: ImagePlaceholder;
  link: string;
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
  { id: '1', name: 'Restaurantes', slug: 'restaurantes', Icon: Utensils },
  { id: '2', name: 'Bebidas', slug: 'bebidas', Icon: GlassWater },
  { id: '3', name: 'Faça-Feira', slug: 'faca-feira', Icon: ShoppingBasket },
  { id: '4', name: 'Artesanatos', slug: 'artesanatos', Icon: Brush },
  { id: '5', name: 'Gás e Água', slug: 'gas-e-agua', Icon: Droplets },
  { id: '6', name: 'Pets', slug: 'pets', Icon: Dog },
  { id: '7', name: 'Farmácias', slug: 'farmacias', Icon: Pill },
  { id: '8', name: 'Serviços', slug: 'servicos', Icon: Wrench },
];

export const mockBanners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Feira Orgânica',
    subtitle: 'Produtos frescos toda semana!',
    image: findImage('banner-fruits-vegetables'),
    link: '/categorias/faca-feira',
  },
  {
    id: 'banner-2',
    title: 'Arte que Inspira',
    subtitle: 'Descubra o artesanato local.',
    image: findImage('banner-crafts'),
    link: '/categorias/artesanatos',
  },
  {
    id: 'banner-3',
    title: 'Os Mais Pedidos',
    subtitle: 'Confira os produtos populares!',
    image: findImage('banner-bread-cheese'),
    link: '/home', // Link to a general "popular" page or anchor
  },
];

export const mockProducts: Product[] = [
  // Faça-Feira
  {
    id: '1',
    name: 'Cesta de Orgânicos',
    description: 'Uma seleção fresquinha de vegetais e legumes orgânicos, colhidos direto da horta para a sua mesa.',
    price: 85.5,
    seller: 'Sítio Verde',
    images: [findImage('vegetables'), findImage('carrots'), findImage('lettuce')],
    category: 'Faça-Feira',
  },
  {
    id: '2',
    name: 'Pão Artesanal',
    description: 'Pão de fermentação natural, com casca crocante e miolo macio. Feito com muito carinho.',
    price: 15.0,
    seller: 'Pão da Terra',
    images: [findImage('bread')],
    category: 'Faça-Feira',
  },
  {
    id: '3',
    name: 'Mel Silvestre',
    description: 'Mel puro e delicioso, produzido por abelhas que se alimentam de flores silvestres da nossa região.',
    price: 30.0,
    seller: 'Apiário do Sol',
    images: [findImage('honey')],
    category: 'Faça-Feira',
  },
  {
    id: '6',
    name: 'Tomates Frescos (kg)',
    description: 'Tomates maduros e suculentos, cultivados sem agrotóxicos. Ideais para saladas e molhos.',
    price: 12.0,
    seller: 'Sítio Verde',
    images: [findImage('tomatoes')],
    category: 'Faça-Feira',
  },
  {
    id: '7',
    name: 'Queijo Minas Frescal',
    description: 'Queijo fresco, leve e saboroso, produzido com leite puro da fazenda. Ótimo para o café da manhã.',
    price: 45.0,
    seller: 'Laticínios da Serra',
    images: [findImage('cheese')],
    category: 'Faça-Feira',
  },
  // Artesanatos
  {
    id: '4',
    name: 'Vaso de Cerâmica',
    description: 'Vaso de cerâmica feito à mão por artesãos locais. Cada peça é única e perfeita para suas plantas.',
    price: 50.0,
    seller: 'Arte em Barro',
    images: [findImage('pottery'), findImage('pottery-craft')],
    category: 'Artesanatos',
  },
  {
    id: '8',
    name: 'Pano de Prato Bordado',
    description: 'Pano de prato de alta qualidade, com lindos bordados feitos à mão. Uma peça que une utilidade e beleza.',
    price: 25.0,
    seller: 'Bordados Finos',
    images: [findImage('textiles')],
    category: 'Artesanatos',
  },
  // Serviços
  {
    id: '10',
    name: 'Serviço de Jardinagem',
    description: 'Deixe seu jardim mais bonito com nosso serviço de jardinagem. Cuidamos de tudo para você.',
    price: 120.0,
    seller: 'João Jardineiro',
    images: [findImage('woodworking')], // using as placeholder
    category: 'Serviços',
  },
  // Restaurantes
  {
    id: '11',
    name: 'Pizza Margherita Grande',
    description: 'A clássica pizza Margherita com molho de tomate fresco, mussarela de búfala e manjericão.',
    price: 55.0,
    seller: 'Pizza Bella',
    images: [findImage('vegetables')], // placeholder
    category: 'Restaurantes',
  },
  {
    id: '12',
    name: 'Hambúrguer Artesanal',
    description: 'Delicioso hambúrguer de 180g, queijo cheddar, bacon crocante e pão brioche.',
    price: 35.0,
    seller: 'Burger House',
    images: [findImage('bread')], // placeholder
    category: 'Restaurantes',
  },
  // Bebidas
  {
    id: '13',
    name: 'Suco Natural de Laranja (1L)',
    description: 'Suco de laranja feito na hora, sem adição de açúcar ou conservantes. Pura vitamina C.',
    price: 18.0,
    seller: 'Sucos & Cia',
    images: [findImage('fruits')],
    category: 'Bebidas',
  },
  // Gás e Água
  {
    id: '14',
    name: 'Botijão de Gás P13',
    description: 'Botijão de gás de cozinha de 13kg. Entrega rápida e segura em sua casa.',
    price: 110.0,
    seller: 'Gás Rápido',
    images: [findImage('category-gas-water')],
    category: 'Gás e Água',
  },
  // Pets
  {
    id: '15',
    name: 'Ração para Cães Adultos (15kg)',
    description: 'Alimento completo e balanceado para cães adultos de todas as raças.',
    price: 150.0,
    seller: 'Pet Amigo',
    images: [findImage('category-pets')],
    category: 'Pets',
  },
  // Farmácias
  {
    id: '16',
    name: 'Analgésico 10 Comprimidos',
    description: 'Medicamento analgésico e antitérmico para alívio de dores e febre.',
    price: 15.0,
    seller: 'Farmácia Bem-Estar',
    images: [findImage('category-pharmacy')],
    category: 'Farmácias',
  },
];
