'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// =================================================================================
// PAINEL DE CONTROLE DA ANIMAÇÃO
// Altere os valores nesta lista para customizar a animação da splash screen.
//
// - delay: Duração da etapa em milissegundos.
// - scale: Multiplicador do tamanho da logo (1.0 = 100%, 0.2 = 20%, 20 = 2000%).
// =================================================================================
const ANIMATION_STAGES = [
  { delay: 100, scale: 1.05 }, // 1. Antecipação (crescimento sutil)
  { delay: 400, scale: 0.2 },  // 2. Contração Rápida
  { delay: 150, scale: 1.05 }, // 3. Overshoot (ultrapassagem na expansão)
  { delay: 100, scale: 1.0 },  // 4. Assentamento (volta ao normal)
  { delay: 350, scale: 3.0 },  // 5. Clímax: Expansão final para 30% da tela
];
// =================================================================================

export default function SplashPage() {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    if (stage >= ANIMATION_STAGES.length) {
      const finalDelay = 150; 
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        router.push('/welcome');
      }, finalDelay);

      return () => clearTimeout(timeout);
    }

    const currentAction = ANIMATION_STAGES[stage];
    const timeout = setTimeout(() => {
      setStage(stage + 1);
    }, currentAction.delay);

    return () => clearTimeout(timeout);
  }, [stage, router, isAnimating]);

  const isFinalTransition = !isAnimating;
  const currentScale = stage > 0 ? ANIMATION_STAGES[stage - 1].scale : 1.0;
  const logoSize = 144;
  const animatedSize = logoSize * currentScale;

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col items-center justify-center overflow-hidden bg-transparent shadow-2xl">
      
      {/* 1. Container do Texto e Logo (some na etapa final) */}
      <div className={cn('relative z-10 flex flex-col items-center justify-center transition-opacity duration-500', isFinalTransition ? 'opacity-0' : 'opacity-100')}>
        <div className="flex h-80 w-72 flex-col items-center justify-between p-8">
            <h1
                className="font-logo text-7xl"
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

      {/* 2. Logo animada */}
      <div
        className="absolute z-20 flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{
          width: `${animatedSize}px`,
          height: `${animatedSize}px`,
          opacity: isFinalTransition ? 0 : 1,
        }}
      >
        <Image
          src="/logo.svg"
          alt="Cuidja Logo"
          width={animatedSize}
          height={animatedSize}
          className="object-contain"
          priority
        />
      </div>

       {/* 3. Pontos de carregamento (somem na etapa final) */}
      <div
        className={cn(
          'absolute bottom-20 z-10 flex space-x-2 transition-opacity duration-500',
          isFinalTransition ? 'opacity-0' : 'opacity-100'
        )}
      >
        <div className="h-3 w-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="h-3 w-3 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="h-3 w-3 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}
