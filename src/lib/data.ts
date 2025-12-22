
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

export interface Service {
    id: string;
    name: string;
    description: string;
    providerId: string; // This is the same as storeId
    category: 'Serviços';
    images: ImagePlaceholder[];
    visitFee?: number; // Optional fee for technical visit or contact
}

export interface CartItem extends Product {
    cartItemId?: string;
    selectedAddons?: Addon[];
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
    link: '/home', // Link to a general "popular" page or anchor
  },
];

export const mockStores: Store[] = [
  // Faça-Feira
  { id: 'sitiov', name: 'Sítio Verde', category: 'Faça-Feira', logo: findImage('vegetables') },
  { id: 'paodaterra', name: 'Pão da Terra', category: 'Faça-Feira', logo: findImage('bread') },
  { id: 'apiariosol', name: 'Apiário do Sol', category: 'Faça-Feira', logo: findImage('honey') },
  { id: 'laticiniosserra', name: 'Laticínios da Serra', category: 'Faça-Feira', logo: findImage('cheese') },
  // Artesanatos
  { id: 'artebarro', name: 'Arte em Barro', category: 'Artesanatos', logo: findImage('pottery') },
  { id: 'bordadosfinos', name: 'Bordados Finos', category: 'Artesanatos', logo: findImage('textiles') },
  { id: 'madeiraviva', name: 'Madeira Viva', category: 'Artesanatos', logo: findImage('woodworking') },
  // Serviços
  { id: 'joaojardineiro', name: 'João Jardineiro', category: 'Serviços', logo: findImage('gardening-service') },
  { id: 'maridodefaztudo', name: 'Marido de Aluguel Faz-Tudo', category: 'Serviços', logo: findImage('tools-for-hire') },
  { id: 'musiclass', name: 'Musiclass', category: 'Serviços', logo: findImage('guitar-teacher') },
  // Restaurantes
  { id: 'pizzabella', name: 'Pizza Bella', category: 'Restaurantes', logo: findImage('pizza') },
  { id: 'burgerhouse', name: 'Burger House', category: 'Restaurantes', logo: findImage('burger-logo') },
  { id: 'cantinhodavo', name: 'Cantinho da Vó', category: 'Restaurantes', logo: findImage('cake-logo')},
  // Bebidas
  { id: 'sucoscia', name: 'Sucos & Cia', category: 'Bebidas', logo: findImage('fruits') },
  // Gás e Água
  { id: 'gasrapido', name: 'Gás Rápido', category: 'Gás e Água', logo: findImage('category-gas-water') },
  // Pets
  { id: 'petamigo', name: 'Pet Amigo', category: 'Pets', logo: findImage('category-pets') },
  // Farmácias
  { id: 'farmabemestar', name: 'Farmácia Bem-Estar', category: 'Farmácias', logo: findImage('category-pharmacy') },
];

export const mockProducts: Product[] = [
  // Faça-Feira
  {
    id: '1',
    name: 'Cesta de Orgânicos',
    description: 'Uma seleção fresquinha de vegetais e legumes orgânicos, colhidos direto da horta para a sua mesa.',
    price: 85.5,
    storeId: 'sitiov',
    images: [findImage('vegetables'), findImage('carrots'), findImage('lettuce')],
    category: 'Faça-Feira',
  },
  {
    id: '2',
    name: 'Pão Artesanal de Fermentação Natural',
    description: 'Pão de fermentação natural, com casca crocante e miolo macio. Feito com muito carinho.',
    price: 22.0,
    storeId: 'paodaterra',
    images: [findImage('bread')],
    category: 'Faça-Feira',
  },
  {
    id: '3',
    name: 'Mel Silvestre 500g',
    description: 'Mel puro e delicioso, produzido por abelhas que se alimentam de flores silvestres da nossa região.',
    price: 35.0,
    storeId: 'apiariosol',
    images: [findImage('honey')],
    category: 'Faça-Feira',
  },
  {
    id: '6',
    name: 'Tomates Frescos (kg)',
    description: 'Tomates maduros e suculentos, cultivados sem agrotóxicos. Ideais para saladas e molhos.',
    price: 12.0,
    storeId: 'sitiov',
    images: [findImage('tomatoes')],
    category: 'Faça-Feira',
  },
  {
    id: '7',
    name: 'Queijo Minas Frescal 500g',
    description: 'Queijo fresco, leve e saboroso, produzido com leite puro da fazenda. Ótimo para o café da manhã.',
    price: 45.0,
    storeId: 'laticiniosserra',
    images: [findImage('cheese')],
    category: 'Faça-Feira',
  },
   {
    id: '17',
    name: 'Ovos Caipira (Dúzia)',
    description: 'Ovos de galinhas criadas soltas, com uma gema mais amarela e sabor incomparável.',
    price: 18.0,
    storeId: 'sitiov',
    images: [findImage('farm-eggs')],
    category: 'Faça-Feira',
  },
  {
    id: '18',
    name: 'Bolo de Fubá com Goiabada',
    description: 'Aquele bolo fofinho que lembra casa de vó, com pedaços de goiabada derretendo.',
    price: 25.0,
    storeId: 'paodaterra',
    images: [findImage('corn-cake')],
    category: 'Faça-Feira',
  },
  {
    id: '19',
    name: 'Doce de Leite Pastoso 400g',
    description: 'O verdadeiro sabor do doce de leite mineiro, cremoso e irresistível.',
    price: 22.0,
    storeId: 'laticiniosserra',
    images: [findImage('dulce-de-leche')],
    category: 'Faça-Feira',
  },
  // Artesanatos
  {
    id: '4',
    name: 'Vaso de Cerâmica "Sol"',
    description: 'Vaso de cerâmica feito à mão por artesãos locais. Cada peça é única e perfeita para suas plantas.',
    price: 50.0,
    storeId: 'artebarro',
    images: [findImage('pottery'), findImage('pottery-craft')],
    category: 'Artesanatos',
  },
  {
    id: '8',
    name: 'Pano de Prato Bordado "Flores"',
    description: 'Pano de prato de alta qualidade, com lindos bordados feitos à mão. Uma peça que une utilidade e beleza.',
    price: 25.0,
    storeId: 'bordadosfinos',
    images: [findImage('textiles')],
    category: 'Artesanatos',
  },
   {
    id: '20',
    name: 'Tábua de Corte em Madeira Nobre',
    description: 'Tábua de corte robusta e elegante, feita com madeira de demolição. Perfeita para servir e cortar.',
    price: 120.0,
    storeId: 'madeiraviva',
    images: [findImage('wood-board')],
    category: 'Artesanatos',
  },
  {
    id: '21',
    name: 'Caneca de Cerâmica "Manhã"',
    description: 'Comece seu dia com uma caneca exclusiva, moldada e pintada à mão. Ideal para café ou chá.',
    price: 45.0,
    storeId: 'artebarro',
    images: [findImage('ceramic-mug')],
    category: 'Artesanatos',
  },
  // Restaurantes
  {
    id: '11',
    name: 'Pizza Margherita Grande',
    description: 'A clássica pizza Margherita com molho de tomate fresco, mussarela de búfala e manjericão.',
    price: 55.0,
    storeId: 'pizzabella',
    images: [findImage('pizza')],
    category: 'Restaurantes',
    addons: [
        {
            id: 'borda',
            title: 'Borda Recheada',
            type: 'single',
            addons: [
                { name: 'Sem Borda', price: 0 },
                { name: 'Catupiry', price: 8.00 },
                { name: 'Cheddar', price: 8.00 },
                { name: 'Cream Cheese', price: 10.00 }
            ]
        },
        {
            id: 'bebida',
            title: 'Adicionar Bebida',
            type: 'multiple',
            addons: [
                { name: 'Refrigerante 2L', price: 12.00 },
                { name: 'Suco 1L', price: 10.00 },
                { name: 'Água Mineral', price: 5.00 }
            ]
        }
    ]
  },
  {
    id: '12',
    name: 'Burger Clássico',
    description: 'Delicioso hambúrguer de 180g, queijo cheddar, bacon crocante e pão brioche.',
    price: 35.0,
    storeId: 'burgerhouse',
    images: [findImage('burger-classic')], // placeholder
    category: 'Restaurantes',
  },
  {
    id: '22',
    name: 'Fatia de Bolo de Cenoura com Chocolate',
    description: 'Uma fatia generosa do melhor bolo de cenoura, com uma cobertura cremosa de brigadeiro.',
    price: 12.0,
    storeId: 'cantinhodavo',
    images: [findImage('carrot-cake')],
    category: 'Restaurantes',
  },
  {
    id: '23',
    name: 'Pizza de Calabresa Grande',
    description: 'Molho de tomate, calabresa fatiada, cebola e azeitonas. Uma explosão de sabor!',
    price: 50.0,
    storeId: 'pizzabella',
    images: [findImage('pizza-pepperoni')],
    category: 'Restaurantes',
  },
  // Bebidas
  {
    id: '13',
    name: 'Suco Natural de Laranja (1L)',
    description: 'Suco de laranja feito na hora, sem adição de açúcar ou conservantes. Pura vitamina C.',
    price: 18.0,
    storeId: 'sucoscia',
    images: [findImage('fruits')],
    category: 'Bebidas',
  },
  // Gás e Água
  {
    id: '14',
    name: 'Botijão de Gás P13',
    description: 'Botijão de gás de cozinha de 13kg. Entrega rápida e segura em sua casa.',
    price: 110.0,
    storeId: 'gasrapido',
    images: [findImage('category-gas-water')],
    category: 'Gás e Água',
  },
  // Pets
  {
    id: '15',
    name: 'Ração para Cães Adultos (15kg)',
    description: 'Alimento completo e balanceado para cães adultos de todas as raças.',
    price: 150.0,
    storeId: 'petamigo',
    images: [findImage('category-pets')],
    category: 'Pets',
  },
  // Farmácias
  {
    id: '16',
    name: 'Analgésico 10 Comprimidos',
    description: 'Medicamento analgésico e antitérmico para alívio de dores e febre.',
    price: 15.0,
    storeId: 'farmabemestar',
    images: [findImage('category-pharmacy')],
    category: 'Farmácias',
  },
];

export const mockServices: Service[] = [
    {
        id: 'serv-jardinagem',
        name: 'Serviço de Jardinagem',
        description: 'Manutenção de jardins, poda de árvores, controle de pragas e plantio. Deixe seu jardim mais bonito com nosso serviço especializado.',
        providerId: 'joaojardineiro',
        category: 'Serviços',
        images: [findImage('gardening-service')],
        visitFee: 50.00
    },
    {
        id: 'serv-reparos',
        name: 'Pequenos Reparos e Manutenção',
        description: 'Serviços de "Marido de Aluguel" para instalações elétricas, hidráulicas, montagem de móveis e pequenos reparos domésticos.',
        providerId: 'maridodefaztudo',
        category: 'Serviços',
        images: [findImage('tools-for-hire')],
        visitFee: 70.00
    },
     {
        id: 'serv-marcenaria',
        name: 'Orçamento de Marcenaria',
        description: 'Criação de móveis planejados e projetos em madeira. Entre em contato para um orçamento sem compromisso.',
        providerId: 'madeiraviva',
        category: 'Serviços',
        images: [findImage('woodworking')],
        visitFee: 0 // Free contact
    },
    {
        id: 'serv-aula-violao',
        name: 'Aula Particular de Violão',
        description: 'Aulas de violão para iniciantes e intermediários. Aprenda a tocar suas músicas favoritas. Pacotes mensais ou aulas avulsas.',
        providerId: 'musiclass',
        category: 'Serviços',
        images: [findImage('guitar-teacher')],
        visitFee: 40 // "Taxa" para aula experimental
    }
];

    