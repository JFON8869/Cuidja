'use client';

import React, { createContext, useContext, useState } from 'react';
import { Product, mockProducts } from '@/lib/data';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  const addProduct = (product: Product) => {
    setProducts((prevProducts) => [product, ...prevProducts]);
  };

  const removeProduct = (productId: string) => {
    setProducts((prevProducts) => prevProducts.filter(p => p.id !== productId));
  }

  return (
    <ProductContext.Provider value={{ products, addProduct, removeProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
}
