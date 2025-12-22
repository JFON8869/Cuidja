"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, User, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/buscar", label: "Busca", icon: Search },
  { href: "/carrinho", label: "Carrinho", icon: ShoppingCart },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-16 bg-card border-t z-10">
      <div className="flex justify-around items-center h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
