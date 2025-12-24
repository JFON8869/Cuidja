'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SplashPage() {
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // --- ROADMAP DA ANIMAÇÃO ---
    // Este é o roteiro da animação, equilibrado para um movimento profissional.
    const sequence = [
      // Etapa 0: Início estático para o usuário registrar a logo.
      { delay: 500, nextStep: 1 },

      // Etapa 1: "Antecipação" - A logo cresce um pouco antes de encolher.
      // Isso prepara o espectador para a ação principal, um princípio de animação clássico.
      { delay: 150, nextStep: 2 },

      // Etapa 2: "Ação Principal" - Contração rápida e profunda para 20%.
      { delay: 400, nextStep: 3 },
      
      // Etapa 3 a 5: "Assentamento" (Settle) - A logo volta ao normal com um leve "overshoot".
      // Ela não para em 100% bruscamente, mas passa um pouco (105%) e depois assenta.
      // Isso dá peso e realismo ao movimento.
      { delay: 350, nextStep: 4 }, // Cresce para 90%
      { delay: 250, nextStep: 5 }, // Passa um pouco, indo para 105% (overshoot)
      { delay: 300, nextStep: 6 }, // Assenta em 100%

      // Etapa 6: "Pausa" - Uma pausa longa com a logo estável, criando antecipação para o final.
      { delay: 600, nextStep: 7 },

      // Etapa 7: "Clímax" - A transição mais rápida. A logo se expande para tomar a tela.
      { delay: 350, action: () => router.push('/welcome') },
    ];

    let currentTimeout: NodeJS.Timeout;

    const runAnimation = (step: number) => {
      if (step >= sequence.length) return;
      const { delay, nextStep, action } = sequence[step];
      
      currentTimeout = setTimeout(() => {
        if (action) {
           setAnimationStep(step); // Trigger the final visual step
           action();
        } else if (nextStep !== undefined) {
           setAnimationStep(nextStep);
           runAnimation(nextStep);
        }
      }, delay);
    };
    
    // Inicia a animação a partir do passo 0
    runAnimation(0);
    
    // Limpeza ao desmontar o componente
    return () => clearTimeout(currentTimeout);
    
  }, [router]); // router é uma dependência estável, então o efeito roda uma vez


  // Mapeamento das etapas do roadmap para as classes de transformação (tamanho/escala)
  const getLogoScaleClass = () => {
    switch (animationStep) {
      case 0: return 'scale-100'; // Etapa 0: Início
      case 1: return 'scale-105'; // Etapa 1: Antecipação
      case 2: return 'scale-20';  // Etapa 2: Contração Profunda
      case 3: return 'scale-90';  // Etapa 3: Início da expansão
      case 4: return 'scale-105'; // Etapa 4: "Overshoot"
      case 5: return 'scale-100'; // Etapa 5: Assentamento
      case 6: return 'scale-100'; // Etapa 6: Pausa
      case 7: return 'scale-[10]';// Etapa 7: Clímax (Expansão Final)
      default: return 'scale-100';
    }
  };

  const isFinalStep = animationStep >= 7;

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col overflow-hidden bg-gradient-to-b from-blue-100 via-orange-100 to-orange-200 shadow-2xl">
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative flex h-full w-full flex-col items-center justify-center px-8">
          {/* Hexagonal Container - This fades out on the final animation step */}
          <div
            className={cn(
              'relative transition-opacity duration-500',
              isFinalStep ? 'opacity-0' : 'opacity-100'
            )}
          >
            {/* Hexagon Background */}
            <div className="relative flex h-80 w-72 items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="absolute h-full w-full"
                style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }}
              >
                <defs>
                  <linearGradient
                    id="hexGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{
                        stopColor: 'rgba(255,255,255,0.6)',
                        stopOpacity: 1,
                      }}
                    />
                    <stop
                      offset="50%"
                      style={{
                        stopColor: 'rgba(255,255,255,0.3)',
                        stopOpacity: 1,
                      }}
                    />
                    <stop
                      offset="100%"
                      style={{
                        stopColor: 'rgba(255,255,255,0.1)',
                        stopOpacity: 1,
                      }}
                    />
                  </linearGradient>
                </defs>
                <polygon
                  points="50 1 95 25 95 75 50 99 5 75 5 25"
                  fill="url(#hexGradient)"
                  stroke="rgba(0, 0, 0, 0.3)"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Content Inside Hexagon */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Logo Title */}
                <div className="mb-4">
                  <h1
                    className="text-7xl font-black tracking-tight"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    <span
                      className="inline-block text-orange-500"
                      style={{
                        textShadow:
                          '2px 2px 0px rgba(139, 69, 19, 0.3), 3px 3px 0px rgba(255, 255, 255, 0.5), 4px 4px 8px rgba(0, 0, 0, 0.2)',
                        transform: 'translateY(-2px)',
                      }}
                    >
                      Cuid
                    </span>
                    <span
                      className="inline-block text-teal-400"
                      style={{
                        textShadow:
                          '2px 2px 0px rgba(0, 100, 100, 0.3), 3px 3px 0px rgba(255, 255, 255, 0.5), 4px 4px 8px rgba(0, 0, 0, 0.2)',
                        transform: 'translateY(-2px)',
                      }}
                    >
                      ja
                    </span>
                  </h1>
                </div>

                {/* Subtitle */}
                <div className="text-center">
                  <p
                    className="text-lg font-bold uppercase tracking-widest text-gray-900"
                    style={{
                      textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    O seu comércio local
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Image - now absolutely positioned to animate independently */}
          <img
            src="/logo.svg"
            alt="Cuidja Logo"
            className={cn(
              'absolute h-36 w-36 object-contain transition-transform duration-500 ease-in-out',
              getLogoScaleClass()
            )}
          />

          {/* Loading Animation */}
          <div
            className={cn(
              'absolute bottom-20 flex space-x-2 transition-opacity duration-500',
              isFinalStep ? 'opacity-0' : 'opacity-100'
            )}
          >
            <div
              className="h-3 w-3 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: '0s' }}
            ></div>
            <div
              className="h-3 w-3 rounded-full bg-teal-400 animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="h-3 w-3 rounded-full bg-orange-400 animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
