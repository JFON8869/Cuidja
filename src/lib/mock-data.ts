import { Product, ImagePlaceholder } from './data';
import { PlaceHolderImages } from './placeholder-images';

// Helper to find images from the JSON for mock data
const findImage = (id: string): ImagePlaceholder => {
    const image = PlaceHolderImages.find(p => p.id === id);
    if (image) {
        return image;
    }
    // Fallback if the image ID is not found in the JSON
    return {
        id: 'fallback',
        imageUrl: `https://picsum.photos/seed/${id}/400/400`,
        imageHint: 'placeholder',
        description: 'Fallback image'
    };
};

export const mockProducts: Omit<Product, 'id' | 'storeId' | 'sellerId' | 'createdAt'>[] = [
    {
        name: "Hambúrguer Artesanal Clássico",
        price: 28.50,
        description: "Pão brioche, 150g de blend da casa, queijo prato, alface, tomate e maionese especial.",
        images: [findImage('burger-classic')],
        category: "Restaurantes",
        type: "PRODUCT",
        availability: "available",
        addons: [
            {
                id: "burg_addons_1",
                title: "Turbine seu Burger",
                type: "multiple",
                addons: [
                    { name: "Bacon Crocante", price: 5.00 },
                    { name: "Cebola Caramelizada", price: 4.00 },
                    { name: "Queijo Extra", price: 3.50 }
                ]
            }
        ]
    },
    {
        name: "Bolo de Cenoura com Cobertura de Brigadeiro",
        price: 15.00,
        description: "Fatia generosa de bolo de cenoura fofinho com uma camada irresistível de brigadeiro cremoso.",
        images: [findImage('carrot-cake')],
        category: "Restaurantes",
        type: "PRODUCT",
        availability: "on_demand"
    },
    {
        name: "Pizza Grande (Metade Calabresa, Metade 4 Queijos)",
        price: 55.00,
        description: "Pizza grande com 8 fatias, metade com calabresa acebolada e metade com a combinação perfeita de muçarela, provolone, gorgonzola e parmesão.",
        images: [findImage('pizza-pepperoni')],
        category: "Restaurantes",
        type: "PRODUCT",
        availability: "available",
        addons: [
            {
                id: "pizza_addons_1",
                title: "Adicionar Borda Recheada",
                type: "single",
                addons: [
                    { name: "Catupiry", price: 8.00 },
                    { name: "Cheddar", price: 8.00 },
                    { name: "Chocolate", price: 10.00 }
                ]
            }
        ]
    },
    {
        name: "Cerveja Artesanal IPA (500ml)",
        price: 22.00,
        description: "Cerveja India Pale Ale com amargor equilibrado e notas cítricas. Produção local.",
        images: [findImage('fruits')], // Simulating a craft beer image
        category: "Bebidas",
        type: "PRODUCT",
        availability: "available"
    },
    {
        name: "Kit de Legumes Orgânicos da Semana",
        price: 45.00,
        description: "Uma cesta variada com legumes frescos e orgânicos, colhidos na semana. Inclui cenoura, batata, abobrinha, e mais.",
        images: [findImage('vegetables')],
        category: "Faça-Feira",
        type: "PRODUCT",
        availability: "available"
    },
     {
        name: "Geleia de Morango Artesanal (250g)",
        price: 18.00,
        description: "Feita com morangos frescos e selecionados, com menos açúcar e mais sabor de fruta.",
        images: [findImage('jam')],
        category: "Faça-Feira",
        type: "PRODUCT",
        availability: "available"
    },
    {
        name: "Tábua de Corte Artesanal em Madeira Nobre",
        price: 120.00,
        description: "Peça única feita à mão com madeira de demolição tratada. Perfeita para servir frios ou como objeto de decoração.",
        images: [findImage('wood-board')],
        category: "Artesanatos",
        type: "PRODUCT",
        availability: "available"
    },
    {
        name: "Caneca de Cerâmica Esmaltada",
        price: 45.00,
        description: "Caneca de 300ml modelada e esmaltada à mão. Cada peça possui um design único. Ideal para café ou chá.",
        images: [findImage('ceramic-mug')],
        category: "Artesanatos",
        type: "PRODUCT",
        availability: "unavailable"
    },
     {
        name: "Botijão de Gás P13",
        price: 110.00,
        description: "Botijão de gás de cozinha de 13kg. Entrega rápida na sua região.",
        images: [findImage('gas-e-agua')],
        category: "Gás e Água",
        type: "PRODUCT",
        availability: "available"
    },
    {
        name: "Ração Premium para Cães Adultos (1kg)",
        price: 35.00,
        description: "Ração balanceada com ingredientes de alta qualidade para cães de todas as raças.",
        images: [findImage('pets')],
        category: "Pets",
        type: "PRODUCT",
        availability: "available"
    },
    {
        name: "Analgésico (Cartela com 10 comprimidos)",
        price: 12.00,
        description: "Medicamento analgésico para alívio de dores de cabeça e dores no corpo.",
        images: [findImage('farmacias')],
        category: "Farmácias",
        type: "PRODUCT",
        availability: "available"
    },
];

export const mockServices: Omit<Product, 'id' | 'storeId' | 'sellerId' | 'createdAt' | 'addons' | 'category' >[] = [
    {
        name: "Aula Particular de Violão (Iniciante)",
        price: 80.00,
        description: "Aula com 1 hora de duração focada em fundamentos, acordes básicos e ritmo. Aprenda a tocar suas primeiras músicas.",
        images: [findImage('guitar-teacher')],
        type: "SERVICE",
        availability: "on_demand",
        attendanceType: 'ambos'
    },
    {
        name: "Serviços de Jardinagem e Paisagismo",
        price: 150.00,
        description: "Manutenção de jardins, poda, plantio e consultoria para criar o jardim dos seus sonhos. Preço por visita/hora a combinar.",
        images: [findImage('gardening-service')],
        type: "SERVICE",
        availability: "on_demand",
        attendanceType: 'presencial'
    },
    {
        name: "Marido de Aluguel - Pequenos Reparos",
        price: 0,
        description: "Realizo pequenos reparos domésticos como instalação de prateleiras, chuveiros, reparos elétricos e hidráulicos. Orçamento sem compromisso.",
        images: [findImage('tools-for-hire')],
        type: "SERVICE",
        availability: "on_demand",
        attendanceType: 'presencial'
    }
];
