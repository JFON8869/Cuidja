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
  Loader2,
  DatabaseZap,
} from 'lucide-react';
import {
  collection,
  getDocs,
  writeBatch,
  query,
  where,
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { mockProducts, mockServices } from '@/lib/mock-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import BottomNav from '@/components/layout/BottomNav';

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
];

export default function ProfilePage() {
  const { auth, user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      toast.success('Você saiu da sua conta.');
      router.push('/welcome');
    }
  };

  const seedDatabase = async () => {
    if (!firestore || !user) {
      toast.error("Você precisa estar logado para fazer isso.");
      return;
    }
    setIsSeeding(true);

    try {
        // 1. Check for an existing store or create one
        const storesRef = collection(firestore, 'stores');
        const q = query(storesRef, where("userId", "==", user.uid));
        const storeSnapshot = await getDocs(q);
        let storeId: string;
        let storeData: any;

        if (storeSnapshot.empty) {
            console.log("Nenhuma loja encontrada, criando uma nova...");
            const newStoreRef = doc(storesRef);
            storeId = newStoreRef.id;
            storeData = {
                id: storeId,
                userId: user.uid,
                name: "Empório do Sabor Local",
                address: "Rua das Flores, 123 - Centro, Sua Cidade",
                logoUrl: "https://storage.googleapis.com/gemini-studio-assets/ricardo/generic-store-logo.png",
                createdAt: serverTimestamp(),
                 operatingHours: {
                    sun: { isOpen: false, open: "09:00", close: "18:00" },
                    mon: { isOpen: true, open: "09:00", close: "18:00" },
                    tue: { isOpen: true, open: "09:00", close: "18:00" },
                    wed: { isOpen: true, open: "09:00", close: "18:00" },
                    thu: { isOpen: true, open: "09:00", close: "18:00" },
                    fri: { isOpen: true, open: "09:00", close: "18:00" },
                    sat: { isOpen: true, open: "10:00", close: "14:00" },
                }
            };
            await setDoc(newStoreRef, storeData);
        } else {
            const storeDoc = storeSnapshot.docs[0];
            storeId = storeDoc.id;
            storeData = storeDoc.data();
            console.log(`Loja "${storeData.name}" (${storeId}) encontrada.`);
        }
        
        // 2. Batch write products and services
        const batch = writeBatch(firestore);
        const productsCol = collection(firestore, 'products');

        console.log("Adicionando produtos de exemplo...");
        mockProducts.forEach(product => {
            const newProductRef = doc(productsCol);
            batch.set(newProductRef, {
                ...product,
                id: newProductRef.id,
                storeId: storeId,
                sellerId: user.uid,
                createdAt: serverTimestamp(),
            });
        });
        
        console.log("Adicionando serviços de exemplo...");
        mockServices.forEach(service => {
            const newServiceRef = doc(productsCol);
             batch.set(newServiceRef, {
                ...service,
                id: newServiceRef.id,
                storeId: storeId,
                sellerId: user.uid,
                createdAt: serverTimestamp(),
            });
        })

        await batch.commit();
        toast.success("Dados de exemplo criados com sucesso!");

    } catch (error) {
        console.error("Erro ao popular o banco de dados:", error);
        toast.error("Ocorreu um erro. Verifique o console para mais detalhes.");
    } finally {
        setIsSeeding(false);
    }
  }


  if (isUserLoading || !user) {
    return (
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
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
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent pb-16 shadow-2xl">
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
                <Cloud
                  className={cn(
                    'h-4 w-4',
                    user ? 'text-green-500' : 'text-muted-foreground'
                  )}
                />
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {menuItems.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="border-b p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-base">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <div className="p-4 mt-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Sobre o App
          </h3>
        </div>

        <div className="flex flex-col border-y">
          {aboutItems.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="border-t p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-base">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
        
         <div className="p-4 mt-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ferramentas de Desenvolvedor</h3>
        </div>
        
        <div className="flex flex-col border-y">
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="border-t p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left">
                    <DatabaseZap className="w-5 h-5 text-destructive" />
                    <span className="flex-1 text-base text-destructive">Popular Dados de Exemplo</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso irá criar uma loja de exemplo (se não existir) e adicionar vários produtos e serviços para o seu usuário. Essa ação é destinada a testes e não pode ser desfeita facilmente. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={seedDatabase} disabled={isSeeding}>
                    {isSeeding ? <Loader2 className="animate-spin" /> : "Sim, popular dados"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>


        <div className="p-4 mt-4">
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
