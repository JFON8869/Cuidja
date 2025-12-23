'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, User, ShoppingCart, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, or } from 'firebase/firestore';

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
      // Find stores this user owns
      const storesRef = collection(firestore, 'stores');
      const storeQuery = query(storesRef, where('userId', '==', user.uid));
      const storeSnapshot = await getDocs(storeQuery);
      const storeIds = storeSnapshot.docs.map(doc => doc.id);
      
      let unreadFound = false;

      // Build queries
      const buyerUnreadQuery = where('customerId', '==', user.uid);
      const buyerHasUnreadClause = where('buyerHasUnread', '==', true);
      
      let finalQuery;
      
      // If user is also a seller, check their stores too
      if (storeIds.length > 0) {
        const sellerUnreadQuery = where('storeId', 'in', storeIds);
        const sellerHasUnreadClause = where('sellerHasUnread', '==', true);
        
        finalQuery = query(
            collection(firestore, 'orders'),
            or(
                // Is the buyer and has unread messages
                where('customerId', '==', user.uid),
                where('buyerHasUnread', '==', true),
                // Is the seller and has unread messages
                where('storeId', 'in', storeIds),
                where('sellerHasUnread', '==', true)
            )
        );

      } else {
        // Only check for buyer notifications
        finalQuery = query(collection(firestore, 'orders'), buyerUnreadQuery, buyerHasUnreadClause);
      }
        
      try {
        const snapshot = await getDocs(finalQuery);
        unreadFound = !snapshot.empty;
      } catch (e) {
          // This can happen if the `or` query is complex and needs an index.
          // For now, we'll just log it and default to no notifications.
          console.error("Failed to check for notifications, likely needs a Firestore index:", e);
          unreadFound = false;
      }

      setHasNotifications(unreadFound);
    };

    // Use an interval to periodically check for notifications
    const interval = setInterval(checkNotifications, 5000); // Check every 5 seconds
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
