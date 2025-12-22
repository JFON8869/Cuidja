
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, SelectedAddon, Product } from '@/lib/data';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedAddons?: SelectedAddon[]) => void;
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
        const addonsTotal = item.selectedAddons?.reduce((addonAcc, addon) => addonAcc + (addon.price * addon.quantity), 0) || 0;
        // The base price of the item itself is not recounted here, it's part of the item price already.
        return acc + item.price + addonsTotal;
    }, 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (product: Product, selectedAddons: SelectedAddon[] = []) => {
    const cartItemId = `${product.id}-${new Date().getTime()}`;
    
    // Calculate total price for this specific item including its addons
    const addonsTotal = selectedAddons.reduce((acc, addon) => acc + (addon.price * addon.quantity), 0);
    const itemTotal = product.price + addonsTotal;

    const newItem: CartItem = { 
        ...product,
        price: itemTotal, // The price now includes the addons for this specific cart instance
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
