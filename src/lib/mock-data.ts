import { Product, ImagePlaceholder } from './data';

// Helper to find images from the JSON for mock data
const findImage = (id: string, hint: string): ImagePlaceholder => {
    // In a real scenario, you would fetch this from a more robust source
    // For now, we simulate finding an image. The actual URL doesn't matter
    // as much as having a valid object.
    return {
        id: id,
        imageUrl: `https://picsum.photos/seed/${id}/400/400`,
        imageHint: hint,
        description: `Placeholder for ${id}`
    };
};

export const mockProducts: Omit<Product, 'id' | 'storeId' | 'sellerId' | 'createdAt'>[] = [
    {
        name: "Hambúrguer Artesanal Clássico",
        price: 28.50,
        description: "Pão brioche, 150g de blend da casa, queijo prato, alface, tomate e maionese especial.",
        images: [findImage('burger-classic', 'classic burger')],
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
        images: [findImage('carrot-cake', 'carrot cake')],
        category: "Restaurantes",
        type: "PRODUCT",
        availability: "on_demand"
    },
    {
        name: "Pizza Grande (Metade Calabresa, Metade 4 Queijos)",
        price: 55.00,
        description: "Pizza grande com 8 fatias, metade com calabresa acebolada e metade com a combinação perfeita de muçarela, provolone, gorgonzola e parmesão.",
        images: [findImage('pizza-pepperoni', 'pepperoni pizza')],
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
        name: "Tábua de Corte Artesanal em Madeira Nobre",
        price: 120.00,
        description: "Peça única feita à mão com madeira de demolição tratada. Perfeita para servir frios ou como objeto de decoração.",
        images: [findImage('wood-board', 'cutting board')],
        category: "Artesanatos",
        type: "PRODUCT",
        availability: "available"
    },
    {
        name: "Caneca de Cerâmica Esmaltada",
        price: 45.00,
        description: "Caneca de 300ml modelada e esmaltada à mão. Cada peça possui um design único. Ideal para café ou chá.",
        images: [findImage('ceramic-mug', 'ceramic mug')],
        category: "Artesanatos",
        type: "PRODUCT",
        availability: "unavailable"
    },
];

export const mockServices: Omit<Product, 'id' | 'storeId' | 'sellerId' | 'createdAt' | 'addons' | 'availability' | 'category' >[] = [
    {
        name: "Aula Particular de Violão (Iniciante)",
        price: 80.00,
        description: "Aula com 1 hora de duração focada em fundamentos, acordes básicos e ritmo. Aprenda a tocar suas primeiras músicas.",
        images: [findImage('guitar-teacher', 'acoustic guitar')],
        type: "SERVICE",
        attendanceType: 'ambos'
    },
    {
        name: "Serviços de Jardinagem e Paisagismo",
        price: 150.00,
        description: "Manutenção de jardins, poda, plantio e consultoria para criar o jardim dos seus sonhos. Preço por visita/hora a combinar.",
        images: [findImage('gardening-service', 'gardening service')],
        type: "SERVICE",
        attendanceType: 'presencial'
    },
];
