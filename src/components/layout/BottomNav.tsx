'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, User, ShoppingCart, Wrench, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

const navItems = [
  { href: '/home', label: 'Início', icon: Home },
  { href: '/vender', label: 'Vender', icon: PlusCircle },
  { href: '/carrinho', label: 'Carrinho', icon: ShoppingCart },
  { href: '/notificacoes', label: 'Notificações', icon: Bell },
  { href: '/perfil', label: 'Perfil', icon: User, auth: true },
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
  const { user, isUserLoading, firestore } = useFirebase();
  const [isClient, setIsClient] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    async function fetchStoreId() {
      if (!firestore || !user) {
        setStoreId(null);
        return;
      }
      const storesRef = collection(firestore, 'stores');
      const q = query(storesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setStoreId(querySnapshot.docs[0].id);
      } else {
        setStoreId(null);
      }
    }
    if (!isUserLoading) {
      fetchStoreId();
    }
  }, [firestore, user, isUserLoading]);

  const buyerNotificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('customerId', '==', user.uid),
      where('buyerHasUnread', '==', true)
    );
  }, [firestore, user]);

  const sellerNotificationsQuery = useMemoFirebase(() => {
    if (!firestore || !storeId) return null;
    return query(
      collection(firestore, 'orders'),
      where('storeId', '==', storeId),
      where('sellerHasUnread', '==', true)
    );
  }, [firestore, storeId]);
  
  const { data: buyerNotifications } = useCollection(buyerNotificationsQuery);
  const { data: sellerNotifications } = useCollection(sellerNotificationsQuery);

  const hasNotifications = (buyerNotifications?.length ?? 0) > 0 || (sellerNotifications?.length ?? 0) > 0;

  const pagesToHideNav = ['/', '/login', '/signup'];
  if (pagesToHideNav.includes(pathname)) {
    return null; // Don't show nav on specified pages
  }

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 h-16 w-full max-w-sm -translate-x-1/2 border-t bg-card">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon, auth: requiresAuth }) => {
          const isActive =
            (pathname.startsWith(href) && href !== '/home') ||
            pathname === href;
          
          if (requiresAuth && (!isClient || isUserLoading)) {
            return <NavItemSkeleton key={label} label={label} />;
          }
          
          const finalHref = requiresAuth && !user ? '/login' : href;
          const isNotificationsTab = label === 'Notificações';

          return (
            <Link
              key={label}
              href={finalHref}
              className={cn(
                'flex h-full w-full flex-col items-center justify-center gap-1 rounded-md p-2 text-xs font-medium transition-colors relative',
                isActive
                  ? 'bg-muted text-primary'
                  : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {isNotificationsTab && hasNotifications && (
                <span className="absolute right-[22px] top-[10px] flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
