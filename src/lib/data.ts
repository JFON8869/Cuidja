
import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';
import type { LucideIcon } from 'lucide-react';
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


// --- V2 Data Model ---
export type ItemType = 'PRODUCT' | 'SERVICE';
export type OrderType = 'PURCHASE' | 'SERVICE_REQUEST';

export const PurchaseStatus = [
  'Pendente',
  'Confirmado',
  'Em Preparo',
  'Saiu para Entrega',
  'Entregue',
  'Cancelado',
] as const;

export const ServiceRequestStatus = [
  'Solicitação Recebida',
  'Em Conversa',
  'Orçamento Enviado',
  'Em Execução',
  'Concluído',
  'Cancelado',
] as const;

export type PurchaseStatusType = typeof PurchaseStatus[number];
export type ServiceRequestStatusType = typeof ServiceRequestStatus[number];
// --- End V2 Data Model ---

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

export type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface OperatingHours {
  [key: DayOfWeek]: {
    isOpen: boolean;
    open: string;
    close: string;
  };
}

export interface Store {
  id: string;
  name: string;
  category?: string;
  logoUrl?: string;
  userId: string;
  operatingHours?: OperatingHours;
  address?: string;
  bannerUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  storeId: string;
  sellerId: string;
  images: ImagePlaceholder[];
  category: string; // Legacy, `type` is preferred
  type: ItemType; // PRODUCT or SERVICE
  addons?: AddonGroup[];
  availability: 'available' | 'on_demand' | 'unavailable';
  attendanceType?: 'presencial' | 'online' | 'ambos';
  createdAt?: any;
  updatedAt?: any;
}

export interface SelectedAddon {
    name: string;
    price: number;
    quantity: number;
}

export interface CartItem extends Product {
    cartItemId?: string;
    selectedAddons?: SelectedAddon[];
    quantity: number;
}

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

export const mockCategories: Category[] = [
  { id: '1', name: 'Restaurantes', slug: 'restaurantes', icon: Utensils, type: 'PRODUCT' },
  { id: '2', name: 'Bebidas', slug: 'bebidas', icon: Beer, type: 'PRODUCT' },
  { id: '3', name: 'Faça-Feira', slug: 'faca-feira', icon: ShoppingCart, type: 'PRODUCT' },
  { id: '4', name: 'Artesanatos', slug: 'artesanatos', icon: Palette, type: 'PRODUCT' },
  { id: '5', name: 'Gás e Água', slug: 'gas-e-agua', icon: Droplets, type: 'PRODUCT' },
  { id: '6', name: 'Pets', slug: 'pets', icon: Dog, type: 'PRODUCT' },
  { id: '7', name: 'Farmácias', slug: 'farmacias', icon: HeartPulse, type: 'PRODUCT' },
  { id: '8', name: 'Serviços', slug: 'servicos', icon: Wrench, type: 'SERVICE' },
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
