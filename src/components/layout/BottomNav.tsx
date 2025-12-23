'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, User, ShoppingCart, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

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
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isUserLoading || !user || !firestore) {
      setHasNotifications(false);
      return;
    }

    const checkNotifications = async () => {
      try {
        // Query 1: Check for unread notifications as a buyer
        const buyerQuery = query(
          collection(firestore, 'orders'),
          where('customerId', '==', user.uid),
          where('buyerHasUnread', '==', true),
          limit(1)
        );
        const buyerSnapshot = await getDocs(buyerQuery);
        if (!buyerSnapshot.empty) {
          setHasNotifications(true);
          return;
        }

        // Query 2: Check if user is a seller by fetching their stores
        const storesRef = collection(firestore, 'stores');
        const storeQuery = query(storesRef, where('userId', '==', user.uid));
        const storeSnapshot = await getDocs(storeQuery);
        const storeIds = storeSnapshot.docs.map(doc => doc.id);
        
        if (storeIds.length > 0) {
            // Query 3: If they are a seller, check for unread notifications
            const sellerQuery = query(
                collection(firestore, 'orders'),
                where('storeId', 'in', storeIds),
                where('sellerHasUnread', '==', true),
                limit(1)
            );
            const sellerSnapshot = await getDocs(sellerQuery);
            if (!sellerSnapshot.empty) {
                setHasNotifications(true);
                return;
            }
        }
        
        // If we reach here, no unread notifications were found
        setHasNotifications(false);

      } catch (e) {
        console.error("Failed to check for notifications:", e);
        setHasNotifications(false);
      }
    };

    // Use an interval to periodically check for notifications
    const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    checkNotifications(); // Initial check

    return () => clearInterval(interval); // Cleanup interval

  }, [firestore, user, isUserLoading]);


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
