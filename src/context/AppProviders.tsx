'use client';

import { ProductProvider } from './ProductContext';
import { CartProvider } from './CartContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <CartProvider>{children}</CartProvider>
    </ProductProvider>
  );
}
