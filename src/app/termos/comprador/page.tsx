'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BuyerTermsPage() {
  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl">
      <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/perfil">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto text-center">Termos de Uso (Comprador)</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 p-4 space-y-4 text-sm text-muted-foreground text-justify">
        <h2 className="text-lg font-bold text-foreground">1. Visão Geral</h2>
        <p>Bem-vindo ao Cuidja! Estes termos regem o uso da nossa plataforma para a compra de produtos e serviços de comerciantes locais. Ao usar nosso aplicativo, você concorda com estes termos.</p>

        <h2 className="text-lg font-bold text-foreground">2. Compras e Pagamentos</h2>
        <p>Todos os pagamentos são processados de forma segura. O Cuidja atua como intermediário entre você e o vendedor. Disputas sobre produtos devem ser resolvidas diretamente com o vendedor, mas nossa equipe de suporte está disponível para mediar, se necessário.</p>
        
        <h2 className="text-lg font-bold text-foreground">3. Entregas e Retiradas</h2>
        <p>As opções de entrega e retirada são definidas por cada vendedor. Verifique as políticas da loja antes de finalizar a compra. O Cuidja não se responsabiliza por problemas de logística, mas facilitará a comunicação.</p>

        <h2 className="text-lg font-bold text-foreground">4. Conduta do Usuário</h2>
        <p>Esperamos que todos os usuários interajam de forma respeitosa. Qualquer forma de assédio ou fraude resultará na suspensão da conta.</p>

        <h2 className="text-lg font-bold text-foreground">5. Alterações nos Termos</h2>
        <p>Podemos atualizar estes termos periodicamente. Notificaremos você sobre quaisquer alterações significativas.</p>
      </main>
    </div>
  );
}
