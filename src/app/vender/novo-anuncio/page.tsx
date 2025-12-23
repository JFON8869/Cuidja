'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Wrench, ChevronRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/firebase';


function NewAdPage() {
    const router = useRouter();
    const { store, isStoreLoading, isUserLoading } = useFirebase();

    if (isUserLoading || isStoreLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    }
    
    // This is a safeguard. The main /vender page should handle redirection.
    if (!store) {
        router.push('/vender/loja');
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    }
    
    const options = [
        {
            title: "Anunciar um Produto",
            description: "Para itens físicos como comidas, artesanato, etc.",
            icon: Package,
            href: `/vender/novo-produto`
        },
        {
            title: "Oferecer um Serviço",
            description: "Para trabalhos como aulas, consertos, consultoria, etc.",
            icon: Wrench,
            href: `/vender/novo-servico`
        }
    ]

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col bg-transparent shadow-2xl">
      <header className="flex items-center border-b p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vender">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="mx-auto font-headline text-xl">Novo Anúncio</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">O que você quer anunciar?</h2>
            <p className="text-muted-foreground">Escolha uma das opções para começar.</p>
        </div>
        <div className="space-y-4">
            {options.map(opt => (
                <Link key={opt.title} href={opt.href}>
                    <Card className="hover:bg-muted/50 hover:border-primary/50 transition-all">
                        <CardHeader className="flex flex-row items-center gap-4">
                           <opt.icon className="w-8 h-8 text-primary" />
                           <div className="flex-1">
                                <CardTitle>{opt.title}</CardTitle>
                                <CardDescription>{opt.description}</CardDescription>
                           </div>
                           <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
      </main>
    </div>
  );
}


export default function NewAdPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>}>
            <NewAdPage />
        </Suspense>
    )
}
