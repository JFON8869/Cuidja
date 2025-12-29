import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';
import type { LucideIcon } from 'lucide-react';
import React from 'react';
import {
  Utensils,
  Beer,
  ShoppingCart,
  Palette,
  Droplets,
  Dog,
  HeartPulse,
  Wrench,
} from 'lucide-react';
import { ItemType } from './data';


export interface Category {
  id: string;
  name:string;
  slug: string;
  icon: LucideIcon;
  type: ItemType;
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

export const productCategories: Omit<Category, 'type'>[] = [
  { id: '1', name: 'Restaurantes', slug: 'restaurantes', icon: Utensils },
  { id: '2', name: 'Bebidas', slug: 'bebidas', icon: Beer },
  { id: '3', name: 'Faça-Feira', slug: 'faca-feira', icon: ShoppingCart },
  { id: '4', name: 'Artesanatos', slug: 'artesanatos', icon: Palette },
  { id: '5', name: 'Gás e Água', slug: 'gas-e-agua', icon: Droplets },
  { id: '6', name: 'Pets', slug: 'pets', icon: Dog },
  { id: '7', name: 'Farmácias', slug: 'farmacias', icon: HeartPulse },
];

export const serviceCategory: Category = { id: '8', name: 'Serviços', slug: 'servicos', icon: Wrench, type: 'SERVICE' };

// A combined list for rendering on the homepage
export const allCategories: Category[] = [
    ...productCategories.map(c => ({...c, type: 'PRODUCT' as ItemType})),
    serviceCategory,
]

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
    link: '#',
  },
  {
    id: 'banner-4',
    title: 'Profissionais Locais',
    subtitle: 'Encontre o serviço que precisa.',
    image: findImage('banner-services'),
    link: '/categorias/servicos',
  },
];
