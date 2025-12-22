'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PlusCircle,
  Heart,
  User,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';

const navItems = [
  { href: '/home', label: 'Início', icon: Home },
  { href: '/vender', label: 'Vender', icon: PlusCircle },
  { href: '/carrinho', label: 'Carrinho', icon: ShoppingCart },
  { href: '/perfil', label: 'Perfil', icon: User, auth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isUserLoading } = useFirebase();

  const isWelcomePage = pathname === '/';

  if (isWelcomePage) {
    return null; // Don't show nav on the welcome page
  }
  
  return (
    <nav className="fixed bottom-0 left-1/2 z-10 h-12 w-full max-w-sm -translate-x-1/2 border-t bg-card">
      <div className="flex h-full items-center justify-around">
        {navItems.map(({ href, label, icon: Icon, auth: requiresAuth }) => {
          const isActive = pathname.startsWith(href) && href !== '/home' || pathname === href;
          const finalHref = requiresAuth && !user ? '/login' : href;

          if (isUserLoading && requiresAuth) {
             return (
              <div key={label} className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-1 rounded-md bg-muted/50 p-2">
                <div className="h-5 w-5 rounded bg-muted"></div>
                <div className="h-2 w-8 rounded bg-muted"></div>
              </div>
            );
          }

          return (
            <Link
              key={label}
              href={finalHref}
              className={cn(
                'flex h-full w-full flex-col items-center justify-center gap-1 text-xs font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
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
