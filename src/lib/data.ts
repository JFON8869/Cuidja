
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

export interface Addon {
  name: string;
  price: number;
}

export interface AddonGroup {
  id: string;
  title: string;
  type: 'single' | 'multiple';
  addons: Addon[];
}

export interface Store {
  id: string;
  name: string;
  category: string;
  logo: ImagePlaceholder;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  storeId: string;
  images: ImagePlaceholder[];
  category: string;
  addons?: AddonGroup[];
}

export interface SelectedAddon {
    name: string;
    price: number;
    quantity: number;
}

export interface CartItem extends Product {
    cartItemId?: string;
    selectedAddons?: SelectedAddon[];
}

export interface Category {
  id: string;
  name:string;
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
    link: '/mais-vendidos',
  },
  {
    id: 'banner-4',
    title: 'Profissionais Locais',
    subtitle: 'Encontre o serviço que precisa.',
    image: findImage('banner-services'),
    link: '/categorias/servicos',
  },
];
