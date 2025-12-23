'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PlusCircle,
  User,
  ShoppingCart,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';

const navItems = [
  { href: '/home', label: 'Início', icon: Home, auth: false },
  { href: '/vender', label: 'Vender', icon: PlusCircle, auth: true },
  { href: '/carrinho', label: 'Carrinho', icon: ShoppingCart, auth: false },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingBag, auth: true },
  { href: '/perfil', label: 'Perfil', auth: true, icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isUserLoading } = useFirebase();

  // Pages where the nav bar should be completely hidden
  const pagesToHideNav = ['/', '/login', '/signup', '/welcome'];
  if (pagesToHideNav.includes(pathname)) {
    return null;
  }

  // Custom mapping for active state.
  // We want '/home' to be active only when it's the exact path.
  // For other paths, we check if the current path starts with the href.
  const getIsActive = (href: string, currentPath: string) => {
    if (href === '/home') {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  };

  // Check if the current user is not a guest (is a real, authenticated user)
  const isRealUser = user && !user.isAnonymous;

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 h-16 w-full max-w-sm -translate-x-1/2 border-t bg-card">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon, auth: requiresAuth }) => {
          const isActive = getIsActive(href, pathname);
          
          // Determine the correct link. If auth is required and user is not a "real" user, redirect to login.
          const finalHref = requiresAuth && !isRealUser ? '/login' : href;

          return (
            <Link
              key={label}
              href={finalHref}
              className={cn(
                'relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-md p-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
