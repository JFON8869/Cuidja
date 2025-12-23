'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, SelectedAddon, Product } from '@/lib/data';
import { toast } from 'react-hot-toast';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedAddons?: SelectedAddon[], quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getInitialCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cuidja_cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        return [];
      }
    }
  }
  return [];
};


export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(getInitialCart);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cuidja_cart', JSON.stringify(cart));
    }
    const newTotal = cart.reduce((acc, item) => {
        const addonsTotal = item.selectedAddons?.reduce((addonAcc, addon) => addonAcc + (addon.price * addon.quantity), 0) || 0;
        return acc + (item.price * (item.quantity || 1)) + addonsTotal;
    }, 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (product: Product, selectedAddons: SelectedAddon[] = [], quantity: number = 1) => {
    if (cart.length > 0 && cart[0].storeId !== product.storeId) {
        toast.error('Você só pode adicionar itens da mesma loja ao carrinho.');
        return;
    }

    const cartItemId = `${product.id}-${new Date().getTime()}`;
    
    const newItem: CartItem = { 
        ...product,
        cartItemId,
        selectedAddons,
        quantity,
    };

    setCart((prevCart) => [...prevCart, newItem]);
    toast.success(`${product.name} foi adicionado ao carrinho.`);
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
