import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import BottomNav from '@/components/layout/BottomNav';
import { AppProviders } from '@/context/AppProviders';
import { FirebaseClientProvider } from '@/firebase';

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
        <FirebaseClientProvider>
          <AppProviders>
            <div className="gradient-background fixed inset-0 -z-10" />
            <div className="pb-16">
              {children}
            </div>
            <BottomNav />
            <Toaster />
          </AppProviders>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
