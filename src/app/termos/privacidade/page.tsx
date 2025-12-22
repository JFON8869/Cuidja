'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="relative bg-transparent max-w-sm mx-auto flex flex-col min-h-[100dvh] shadow-2xl">
      <header className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/perfil">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-headline mx-auto text-center">Política de Privacidade</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 p-4 space-y-4 text-sm text-muted-foreground text-justify">
        <h2 className="text-lg font-bold text-foreground">1. Coleta de Dados</h2>
        <p>Coletamos informações que você nos fornece no cadastro, como nome e e-mail. Também coletamos dados gerados durante o uso do aplicativo, como histórico de compras, produtos visualizados e mensagens trocadas, para personalizar sua experiência e garantir a segurança da plataforma.</p>

        <h2 className="text-lg font-bold text-foreground">2. Uso dos Dados</h2>
        <p>Seus dados são utilizados para operar, manter e melhorar nossos serviços, processar transações, facilitar a comunicação entre compradores e vendedores, e para fins de segurança. Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para a funcionalidade do serviço (ex: com o vendedor de um pedido).</p>
        
        <h2 className="text-lg font-bold text-foreground">3. Seus Direitos (LGPD)</h2>
        <p>Você tem o direito de acessar, corrigir, excluir ou solicitar a portabilidade de seus dados. Você também pode retirar seu consentimento a qualquer momento. Para exercer seus direitos, entre em contato conosco.</p>

        <h2 className="text-lg font-bold text-foreground">4. Segurança</h2>
        <p>Implementamos medidas de segurança para proteger seus dados contra acesso, alteração, divulgação ou destruição não autorizada. As senhas são armazenadas de forma criptografada e o acesso aos dados é restrito.</p>

        <h2 className="text-lg font-bold text-foreground">5. Alterações na Política</h2>
        <p>Podemos atualizar esta política periodicamente. Notificaremos você sobre quaisquer alterações significativas. Recomendamos que você revise esta política regularmente.</p>
      </main>
    </div>
  );
}
