'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  LogOut,
  User as UserIcon,
  Bell,
  Heart,
  MapPin,
  FileText,
  Lightbulb,
  ChevronRight,
  Shield,
  Cloud,
  Trash,
  Loader2,
} from 'lucide-react';
import { collection, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';


import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/notificacoes', icon: Bell, label: 'Notificações' },
  { href: '/favoritos', icon: Heart, label: 'Favoritos' },
  { href: '/enderecos', icon: MapPin, label: 'Endereços Salvos' },
];

const aboutItems = [
    { href: '/termos/comprador', icon: FileText, label: 'Termos de Uso (Comprador)' },
    { href: '/termos/vendedor', icon: FileText, label: 'Termos de Uso (Vendedor)' },
    { href: '/termos/privacidade', icon: Shield, label: 'Política de Privacidade' },
    { href: '/sugestoes', icon: Lightbulb, label: 'Sugestões' },
]

export default function ProfilePage() {
  const { auth, user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/home');
    }
  };

  const handleCleanup = async () => {
    if (!firestore) {
        toast.error("O banco de dados não está disponível.");
        return;
    }
    setIsCleaning(true);
    toast.loading("Limpando pedidos antigos sem loja...");

    try {
        const ordersRef = collection(firestore, "orders");
        // Query for documents where 'storeId' does NOT exist.
        // Firestore doesn't have a "does not exist" query, so we query for documents
        // where storeId is null, as unset fields are treated as null in queries.
        const q = query(ordersRef, where("storeId", "==", null));
        
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(firestore);
        let deletedCount = 0;

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
            deletedCount++;
        });

        if (deletedCount > 0) {
            await batch.commit();
            toast.dismiss();
            toast.success(`${deletedCount} pedido(s) órfão(s) removido(s) com sucesso!`);
        } else {
            toast.dismiss();
            toast.info("Nenhum pedido órfão para remover foi encontrado.");
        }

    } catch (error) {
        console.error("Cleanup error:", error);
        toast.dismiss();
        toast.error("Ocorreu um erro durante a limpeza.");
    } finally {
        setIsCleaning(false);
    }
  };


  if (isUserLoading || !user) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
        <header className="flex items-center border-b p-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/home">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="mx-auto font-headline text-xl">Seu Perfil</h1>
          <div className="w-10"></div>
        </header>
        <main className="flex-1 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="mt-8 space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/home">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Seu Perfil</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 text-4xl">
              <AvatarImage
                src={user.photoURL || undefined}
                alt="Foto do usuário"
              />
              <AvatarFallback>
                <UserIcon size={40} />
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h2 className="text-xl font-bold">
                {user.displayName || 'Usuário'}
              </h2>
              <div className="flex items-center gap-2">
                 <Cloud className={cn("h-4 w-4", user ? "text-green-500" : "text-muted-foreground")} />
                 <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
            {menuItems.map((item) => (
                <Link href={item.href} key={item.href} className="border-b p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1 text-base">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
            ))}
        </div>
        
        <div className="p-4 mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sobre o App</h3>
        </div>

         <div className="flex flex-col border-b">
            {aboutItems.map((item) => (
                <Link href={item.href} key={item.href} className="border-t p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1 text-base">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
            ))}
            <div className="border-t p-4 flex items-center gap-4">
                <Trash className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-base">Limpar Dados Antigos</span>
                <Button onClick={handleCleanup} disabled={isCleaning} size="sm" variant="destructive">
                    {isCleaning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Limpar
                </Button>
            </div>
        </div>


        <div className="p-4 mt-4">
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </main>
    </div>
  );
}
