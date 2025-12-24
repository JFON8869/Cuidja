import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "react-hot-toast"
import { AppProviders } from '@/context/AppProviders';
import { FirebaseClientProvider } from '@/firebase/client-provider';

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
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&family=Lemon&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="gradient-background fixed inset-0 -z-20" />
        <FirebaseClientProvider>
          <AppProviders>
            {children}
            <Toaster />
          </AppProviders>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
