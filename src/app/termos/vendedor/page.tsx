'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SellerTermsPage() {
  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl">
      <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/perfil">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto text-center">Termos de Uso (Vendedor)</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 p-4 space-y-4 text-sm text-muted-foreground text-justify">
        <h2 className="text-lg font-bold text-foreground">1. Cadastro e Loja</h2>
        <p>Ao se cadastrar como vendedor, você concorda em fornecer informações precisas sobre você e seus produtos. Você é responsável pela gestão de sua loja, incluindo a precisão dos anúncios, preços e estoque.</p>

        <h2 className="text-lg font-bold text-foreground">2. Taxas e Pagamentos</h2>
        <p>O Cuidja cobra uma pequena taxa de serviço sobre cada venda realizada. Os pagamentos serão processados e repassados para sua conta designada dentro do prazo estipulado em nossa política de pagamentos.</p>
        
        <h2 className="text-lg font-bold text-foreground">3. Qualidade e Entrega</h2>
        <p>Você se compromete a oferecer produtos de qualidade e a cumprir os prazos de entrega ou retirada combinados com o cliente. A satisfação do cliente é fundamental para o sucesso da plataforma.</p>

        <h2 className="text-lg font-bold text-foreground">4. Responsabilidades</h2>
        <p>O vendedor é o único responsável legal e fiscal por seus produtos e atividades comerciais. O Cuidja atua como uma plataforma para facilitar a conexão entre vendedores e compradores.</p>

        <h2 className="text-lg font-bold text-foreground">5. Alterações nos Termos</h2>
        <p>Podemos atualizar estes termos periodicamente. Notificaremos você sobre quaisquer alterações significativas que possam impactar suas operações.</p>
      </main>
    </div>
  );
}
