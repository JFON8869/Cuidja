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
        <FirebaseClientProvider>
          <AppProviders>
            <div className="gradient-background fixed inset-0 -z-10" />
            <div className="fixed inset-0 -z-10 flex items-center justify-center opacity-10">
                <svg
                    viewBox="0 0 100 100"
                    className="h-[80vh] w-[80vh] max-h-[800px] max-w-[800px]"
                    style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))' }}
                    >
                    <defs>
                        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.4)', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.1)', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <polygon
                        points="50 1 95 25 95 75 50 99 5 75 5 25"
                        fill="url(#hexGradient)"
                        stroke="rgba(0, 0, 0, 0.1)"
                        strokeWidth="0.5"
                    />
                </svg>
            </div>
            {children}
            <Toaster />
          </AppProviders>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
