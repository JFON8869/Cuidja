import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'Mercado Local Cuidja',
  description: 'Sua plataforma de compras e vendas locais.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="pb-16">
          {children}
        </div>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
