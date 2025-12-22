'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { auth, user, isUserLoading } = useFirebase();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/home');
    }
  };

  if (isUserLoading) {
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
        <main className="flex-1 p-4 flex flex-col items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="w-full space-y-2">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
            <Skeleton className="h-10 w-full" />
        </main>
      </div>
    );
  }

  if (!user) {
    // This should be handled by the navigation logic, but as a fallback:
    router.push('/login');
    return null;
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
      <main className="flex-1 p-4 flex flex-col items-center gap-6">
        <Avatar className="h-24 w-24 text-4xl">
            <AvatarImage src={user.photoURL || undefined} alt="Foto do usuário" />
            <AvatarFallback>
                <UserIcon size={48} />
            </AvatarFallback>
        </Avatar>
        <div className='text-center'>
            <h2 className="text-2xl font-bold">{user.displayName || 'Usuário'}</h2>
            <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
        </Button>
      </main>
    </div>
  );
}
