'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SplashPage() {
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    //
    // --- PONTO DE CONTROLE DA ANIMAÇÃO ---
    // Você pode alterar o valor de `delay` (em milissegundos) em cada etapa para ajustar o ritmo da animação.
    // 1000ms = 1 segundo.
    //
    const sequence = [
      // Etapa 0: Tempo que a tela fica estática no início.
      { delay: 500, nextStep: 1 }, 
      // Etapa 1: Duração da contração para 30% do tamanho.
      { delay: 600, nextStep: 2 }, 
      // Etapa 2: Duração da expansão para 60%.
      { delay: 400, nextStep: 3 }, 
      // Etapa 3: Duração da expansão para 80%.
      { delay: 400, nextStep: 4 },
      // Etapa 4: Duração da expansão de volta para 100%.
      { delay: 400, nextStep: 5 },
      // Etapa 5: Tempo que a logo fica parada antes da expansão final.
      { delay: 500, nextStep: 6 },
      // Etapa 6: Duração da animação de expansão final antes de redirecionar.
      { delay: 350, action: () => router.push('/welcome') }, 
    ];

    let currentTimeout: NodeJS.Timeout;
    
    // Function to run the animation sequence
    const runAnimation = (step: number) => {
        if (step >= sequence.length) return;

        const { delay, nextStep, action } = sequence[step];

        currentTimeout = setTimeout(() => {
            if (nextStep !== undefined) {
                setAnimationStep(nextStep);
                // Recursively call the next step in the sequence
                runAnimation(nextStep);
            }
            if (action) {
                action();
            }
        }, delay);
    }

    // Start the animation sequence from the current step
    runAnimation(animationStep);

    // Cleanup timer on component unmount
    return () => clearTimeout(currentTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLogoScaleClass = () => {
    switch (animationStep) {
      case 0: // Início
        return 'scale-100'; 
      case 1: // Contração
        return 'scale-30'; 
      case 2: // Crescimento 1
        return 'scale-60'; 
      case 3: // Crescimento 2
        return 'scale-80';
      case 4: // Volta ao original
        return 'scale-100';
      case 5: // Pausa antes da expansão final
      case 6: // Expansão final
        return 'scale-[10]';
      default:
        return 'scale-100';
    }
  };
  
  const isFinalStep = animationStep >= 5;

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col overflow-hidden bg-gradient-to-b from-blue-100 via-orange-100 to-orange-200 shadow-2xl">
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative flex h-full w-full flex-col items-center justify-center px-8">
          
          {/* Hexagonal Container - This fades out on the final animation step */}
          <div className={cn("relative transition-opacity duration-500", isFinalStep ? 'opacity-0' : 'opacity-100')}>
            {/* Hexagon Background */}
            <div className="relative flex h-80 w-72 items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute h-full w-full" style={{filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'}}>
                <defs>
                  <linearGradient id="hexGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'rgba(255,255,255,0.6)', stopOpacity: 1}} />
                    <stop offset="50%" style={{stopColor: 'rgba(255,255,255,0.3)', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: 'rgba(255,255,255,0.1)', stopOpacity: 1}} />
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
                  <h1 className="text-7xl font-black tracking-tight" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                    <span className="text-orange-500 inline-block" style={{
                      textShadow: '2px 2px 0px rgba(139, 69, 19, 0.3), 3px 3px 0px rgba(255, 255, 255, 0.5), 4px 4px 8px rgba(0, 0, 0, 0.2)',
                      transform: 'translateY(-2px)'
                    }}>Cuid</span>
                    <span className="text-teal-400 inline-block" style={{
                      textShadow: '2px 2px 0px rgba(0, 100, 100, 0.3), 3px 3px 0px rgba(255, 255, 255, 0.5), 4px 4px 8px rgba(0, 0, 0, 0.2)',
                      transform: 'translateY(-2px)'
                    }}>ja</span>
                  </h1>
                </div>
                
                {/* Invisible Box for Logo to be centered on */}
                <div className="mb-6 h-36 w-36" />
                
                {/* Subtitle */}
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 tracking-widest uppercase" style={{
                    textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                    letterSpacing: '0.1em'
                  }}>
                    O seu comércio local
                  </p>
                </div>
              </div>
            </div>
          </div>

           {/* Logo Image - now absolutely positioned to animate independently */}
           <div className={cn(
              "absolute flex items-center justify-center bg-gradient-to-br from-white/40 to-white/20 rounded-3xl backdrop-blur-sm shadow-lg border border-white/30 transition-transform duration-500 ease-in-out",
              isFinalStep && "bg-white/80", // Make bg more opaque on final step
              getLogoScaleClass()
            )} style={{width: '9rem', height: '9rem'}}>
              <img 
                src="/logo.svg" 
                alt="Cuidja Logo" 
                className="w-full h-full object-contain p-3"
                style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'}}
              />
            </div>
          
          {/* Loading Animation */}
          <div className={cn(
              "absolute bottom-20 flex space-x-2 transition-opacity duration-500",
              isFinalStep ? 'opacity-0' : 'opacity-100'
            )}>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
