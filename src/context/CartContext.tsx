'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { CartItem, SelectedAddon, Product } from '@/lib/data';
import { toast } from 'react-hot-toast';
import { useFirebase } from '@/firebase';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedAddons?: SelectedAddon[], quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  total: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to get cart from localStorage
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
  const [isLoading, setIsLoading] = useState(true);
  const { firestore } = useFirebase();

  const validateCart = useCallback(async (currentCart: CartItem[]) => {
    if (!firestore || currentCart.length === 0) {
      setIsLoading(false);
      return currentCart;
    }
    
    setIsLoading(true);
    let validCart: CartItem[] = [];
    let wasItemRemoved = false;
    
    for (const item of currentCart) {
      const productRef = doc(firestore, 'products', item.id);
      try {
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          validCart.push(item);
        } else {
          wasItemRemoved = true;
        }
      } catch (e) {
        console.error(`Error validating product ${item.id}:`, e);
        // Keep item in cart if validation fails, to not lose user data
        validCart.push(item); 
      }
    }

    if (wasItemRemoved) {
        toast.error('Um ou mais itens no seu carrinho não estão mais disponíveis e foram removidos.');
    }
    
    setIsLoading(false);
    return validCart;
  }, [firestore]);


  useEffect(() => {
    validateCart(cart).then(validatedCart => {
        if (JSON.stringify(cart) !== JSON.stringify(validatedCart)) {
            setCart(validatedCart);
        } else {
            setIsLoading(false);
        }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cuidja_cart', JSON.stringify(cart));
    }
    // Recalculate total whenever the cart changes
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
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, isLoading }}>
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
