'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Definição das etapas da animação com delay e escala
const ANIMATION_STAGES = [
  { delay: 100, scale: 1.05 }, // 1. Antecipação (crescimento sutil)
  { delay: 400, scale: 0.2 },  // 2. Contração Rápida
  { delay: 300, scale: 1.05 }, // 3. Overshoot (ultrapassagem na expansão)
  { delay: 150, scale: 1.0 },  // 4. Assentamento (volta ao normal)
  { delay: 600, scale: 20 },   // 5. Clímax (expansão final para transição)
];

export default function SplashPage() {
  const router = useRouter();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Se a animação terminou, redireciona
    if (stage >= ANIMATION_STAGES.length) {
      const finalRedirect = setTimeout(() => router.push('/welcome'), 350);
      return () => clearTimeout(finalRedirect);
    }

    // Pega a ação atual baseada no estágio
    const currentAction = ANIMATION_STAGES[stage];
    
    // Define um timeout para avançar para o próximo estágio
    const timeout = setTimeout(() => {
      setStage(stage + 1);
    }, currentAction.delay);

    // Limpa o timeout se o componente for desmontado
    return () => clearTimeout(timeout);
  }, [stage, router]);
  
  const isFinalStage = stage >= ANIMATION_STAGES.length;
  // Pega a escala do estágio anterior para renderizar o estado atual
  const currentScale = stage > 0 ? ANIMATION_STAGES[stage - 1].scale : 1.0;
  
  const logoSize = 144; // Tamanho base da logo em pixels
  const animatedSize = logoSize * currentScale;

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-100 via-orange-100 to-orange-200 shadow-2xl">
      
      {/* Container do Hexágono e Textos (some na etapa final) */}
      <div className={cn('relative flex flex-col items-center justify-center transition-opacity duration-500', isFinalStage ? 'opacity-0' : 'opacity-100')}>
        <svg
          viewBox="0 0 100 100"
          className="absolute h-80 w-72"
          style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }}
        >
          <defs>
            <linearGradient id="hexGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.6)', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,0.3)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.1)', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <polygon
            points="50 1 95 25 95 75 50 99 5 75 5 25"
            fill="url(#hexGradient)"
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="1.5"
          />
        </svg>
        <div className="relative flex h-80 w-72 flex-col items-center justify-between p-8">
            <h1
                className="text-7xl font-black tracking-tight"
                style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                }}
            >
                <span className="text-orange-500">Cuid</span>
                <span className="text-teal-400">ja</span>
            </h1>
            <p
                className="text-sm font-bold uppercase tracking-widest text-gray-900"
                style={{
                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                letterSpacing: '0.1em',
                }}
            >
                O seu comércio local
            </p>
        </div>
      </div>

      {/* Logo animada - mantem a opacidade até o final */}
      <div
        className="absolute flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{
          width: `${animatedSize}px`,
          height: `${animatedSize}px`,
          opacity: isFinalStage ? 0 : 1, // Some apenas após a última etapa de animação ter sido definida
        }}
      >
        <Image
          src="/logo.svg"
          alt="Cuidja Logo"
          width={animatedSize}
          height={animatedSize}
          className="object-contain"
          priority // Prioriza o carregamento da logo
        />
      </div>

       {/* Pontos de carregamento (somem na etapa final) */}
      <div
        className={cn(
          'absolute bottom-20 flex space-x-2 transition-opacity duration-500',
          isFinalStage ? 'opacity-0' : 'opacity-100'
        )}
      >
        <div className="h-3 w-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="h-3 w-3 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="h-3 w-3 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}
