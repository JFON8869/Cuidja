'use client';

import { CartProvider } from './CartContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>{children}</CartProvider>
  );
}
