
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
  category: string; // Used for products to define sub-category
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
