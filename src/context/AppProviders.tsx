'use client';

import { CartProvider } from './CartContext';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <FirebaseErrorListener />
      {children}
    </CartProvider>
  );
}
