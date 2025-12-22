import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

export interface Product {
  id: string;
  name: string;
  price: number;
  seller: string;
  imageId: string;
  image: ImagePlaceholder;
}

export interface Category {
  id: string;
  name: string;
  iconUrl: string;
  hint: string;
}

const findImage = (id: string): ImagePlaceholder => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    throw new Error(`Image with id "${id}" not found.`);
  }
  return image;
};

export const mockCategories: Category[] = [
  { id: '1', name: 'Restaurantes', iconUrl: findImage('category-restaurants').imageUrl, hint: findImage('category-restaurants').imageHint },
  { id: '2', name: 'Bebidas', iconUrl: findImage('category-drinks').imageUrl, hint: findImage('category-drinks').imageHint },
  { id: '3', name: 'Faça-Feira', iconUrl: findImage('category-market').imageUrl, hint: findImage('category-market').imageHint },
  { id: '4', name: 'Artesanatos', iconUrl: findImage('category-crafts').imageUrl, hint: findImage('category-crafts').imageHint },
  { id: '5', name: 'Gás e Água', iconUrl: findImage('category-gas-water').imageUrl, hint: findImage('category-gas-water').imageHint },
  { id: '6', name: 'Pets', iconUrl: findImage('category-pets').imageUrl, hint: findImage('category-pets').imageHint },
  { id: '7', name: 'Farmácias', iconUrl: findImage('category-pharmacy').imageUrl, hint: findImage('category-pharmacy').imageHint },
  { id: '8', name: 'Serviços', iconUrl: findImage('category-services').imageUrl, hint: findImage('category-services').imageHint },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Cesta de Orgânicos',
    price: 85.5,
    seller: 'Sítio Verde',
    imageId: 'vegetables',
    image: findImage('vegetables'),
  },
  {
    id: '2',
    name: 'Pão Artesanal',
    price: 15.0,
    seller: 'Pão da Terra',
    imageId: 'bread',
    image: findImage('bread'),
  },
  {
    id: '3',
    name: 'Mel Silvestre',
    price: 30.0,
    seller: 'Apiário do Sol',
    imageId: 'honey',
    image: findImage('honey'),
  },
  {
    id: '4',
    name: 'Vaso de Cerâmica',
    price: 50.0,
    seller: 'Arte em Barro',
    imageId: 'pottery',
    image: findImage('pottery'),
  },
  {
    id: '5',
    name: 'Geleia de Morango',
    price: 22.0,
    seller: 'Quitutes da Vovó',
    imageId: 'jam',
    image: findImage('jam'),
  },
  {
    id: '6',
    name: 'Tomates Frescos (kg)',
    price: 12.0,
    seller: 'Sítio Verde',
    imageId: 'tomatoes',
    image: findImage('tomatoes'),
  },
  {
    id: '7',
    name: 'Queijo Minas Frescal',
    price: 45.0,
    seller: 'Laticínios da Serra',
    imageId: 'cheese',
    image: findImage('cheese'),
  },
  {
    id: '8',
    name: 'Pano de Prato Bordado',
    price: 25.0,
    seller: 'Bordados Finos',
    imageId: 'textiles',
    image: findImage('textiles'),
  },
  {
    id: '9',
    name: 'Cenouras Orgânicas',
    price: 8.0,
    seller: 'Horta Feliz',
    imageId: 'carrots',
    image: findImage('carrots'),
  },
    {
    id: '10',
    name: 'Serviço de Jardinagem',
    price: 120.0,
    seller: 'João Jardineiro',
    imageId: 'woodworking', // using as placeholder
    image: findImage('woodworking'),
  },
];
