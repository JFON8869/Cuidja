'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Addon, Product } from '@/lib/data';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedAddons?: Addon[]) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => {
        const addonsTotal = item.selectedAddons?.reduce((addonAcc, addon) => addonAcc + addon.price, 0) || 0;
        return acc + item.price + addonsTotal;
    }, 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (product: Product, selectedAddons: Addon[] = []) => {
    const cartItemId = `${product.id}-${new Date().getTime()}`;
    const newItem: CartItem = { 
        ...product, 
        cartItemId,
        selectedAddons 
    };
    setCart((prevCart) => [...prevCart, newItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };
  
  const clearCart = () => {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
