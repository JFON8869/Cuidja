'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SuggestionsPage() {
  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl">
      <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/perfil">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto">Sugestões</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 p-4 space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-bold">Envie sua Sugestão</h2>
            <p className="text-muted-foreground">Adoramos ouvir você! Sua opinião nos ajuda a melhorar.</p>
        </div>
        <form className="space-y-4">
            <div>
                <Label htmlFor="name">Seu Nome (Opcional)</Label>
                <Input id="name" placeholder="Como podemos te chamar?" />
            </div>
            <div>
                <Label htmlFor="suggestion">Sua Sugestão</Label>
                <Textarea id="suggestion" placeholder="Digite sua sugestão, crítica ou elogio aqui..." rows={8}/>
            </div>
            <Button className="w-full" size="lg">Enviar Sugestão</Button>
        </form>
      </main>
    </div>
  );
}
