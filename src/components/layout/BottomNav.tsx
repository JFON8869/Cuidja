'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, User, ShoppingCart, Bell, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';

const navItems = [
  { href: '/home', label: 'Início', icon: Home },
  { href: '/vender', label: 'Vender', icon: PlusCircle, auth: true },
  { href: '/carrinho', label: 'Carrinho', icon: ShoppingCart },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingBag, auth: true },
  { href: '/perfil', label: 'Perfil', auth: true, icon: User },
];

const NavItemSkeleton = ({ label }: { label: string }) => (
  <div
    key={label}
    className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-md p-2"
  >
    <div className="h-5 w-5 rounded bg-muted"></div>
    <div className="h-3 w-8 rounded bg-muted"></div>
  </div>
);

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isUserLoading } = useFirebase();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const pagesToHideNav = ['/', '/login', '/signup'];
  if (pagesToHideNav.includes(pathname)) {
    return null;
  }
  
  // Custom mapping for active state
  const getIsActive = (href: string, currentPath: string) => {
    if (href === '/home') {
        return currentPath === href;
    }
    return currentPath.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 h-16 w-full max-w-sm -translate-x-1/2 border-t bg-card">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon, auth: requiresAuth }) => {
          const isActive = getIsActive(href, pathname);
          
          if (requiresAuth && (!isClient || isUserLoading)) {
            return <NavItemSkeleton key={label} label={label} />;
          }
          
          const finalHref = requiresAuth && !user ? '/login' : href;

          return (
            <Link
              key={label}
              href={finalHref}
              className={cn(
                'flex h-full w-full flex-col items-center justify-center gap-1 rounded-md p-2 text-xs font-medium transition-colors relative',
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
