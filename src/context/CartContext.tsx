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
  isCartLoading: boolean; // Add loading state
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(true); // Start with loading true

  // Effect to load cart from localStorage only on the client side
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cuidja_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      localStorage.removeItem('cuidja_cart'); // Clear corrupted data
    } finally {
      setIsCartLoading(false); // Stop loading after attempting to load
    }
  }, []);


  // Effect to sync cart with localStorage and calculate total
  useEffect(() => {
    // Prevent writing to localStorage on initial server render
    if (!isCartLoading) {
        localStorage.setItem('cuidja_cart', JSON.stringify(cart));
    }
    
    // Calculate new total
    const newTotal = cart.reduce((acc, item) => {
        const addonsTotal = item.selectedAddons?.reduce((addonAcc, addon) => addonAcc + (addon.price * addon.quantity), 0) || 0;
        return acc + (item.price * (item.quantity || 1)) + addonsTotal;
    }, 0);
    setTotal(newTotal);
  }, [cart, isCartLoading]);

  const addToCart = (product: Product, selectedAddons: SelectedAddon[] = [], quantity: number = 1) => {
    // Business rule: only allow items from the same store
    if (cart.length > 0 && cart[0].storeId !== product.storeId) {
        toast.error('Você só pode adicionar itens da mesma loja ao carrinho. Finalize a compra atual ou esvazie seu carrinho.');
        return;
    }

    // Create a unique ID for the cart item instance
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
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, isCartLoading }}>
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
