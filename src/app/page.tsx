'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Defines the sequence of the splash screen animation
const ANIMATION_STAGES = [
  { delay: 100, scale: 1.05 },
  { delay: 400, scale: 0.2 },
  { delay: 150, scale: 1.05 },
  { delay: 100, scale: 1.0 },
  { delay: 350, scale: 3.0 },
];
const LOGO_BASE_SIZE = 144;
const FINAL_ANIMATION_DELAY = 150;
const REDIRECT_DELAY = 300;


export default function SplashPage() {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if the animation sequence is complete
    if (stage >= ANIMATION_STAGES.length) {
      const finalTimeout = setTimeout(() => {
        setIsAnimatingOut(true);
        setTimeout(() => router.push('/welcome'), REDIRECT_DELAY);
      }, FINAL_ANIMATION_DELAY);
      
      return () => clearTimeout(finalTimeout);
    }

    // Progress to the next stage of the animation
    const currentAction = ANIMATION_STAGES[stage];
    const stageTimeout = setTimeout(() => {
      setStage(stage + 1);
    }, currentAction.delay);

    return () => clearTimeout(stageTimeout);
  }, [stage, router]);

  // Determine the current scale for the logo animation
  const currentScale = stage > 0 ? ANIMATION_STAGES[stage - 1].scale : 1.0;
  const animatedSize = LOGO_BASE_SIZE * currentScale;

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col items-center justify-center overflow-hidden bg-transparent shadow-2xl">
      <div
        className={cn(
          'absolute top-24 z-20 text-center transition-opacity duration-500',
          isAnimatingOut ? 'opacity-0' : 'opacity-100'
        )}
      >
        <h1 className="font-logo text-7xl">
          <span className="text-orange-500">Cuid</span>
          <span className="text-teal-400">ja</span>
        </h1>
      </div>

      <div
        className={cn(
          'relative z-10 flex h-full w-full flex-col items-center justify-center transition-opacity duration-500',
          isAnimatingOut ? 'opacity-0' : 'opacity-100'
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="h-80 w-80 opacity-60"
            style={{
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))',
            }}
          >
            <defs>
              <linearGradient id="hexGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{
                    stopColor: 'rgba(255,255,255,0.4)',
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
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        <div
          className="relative flex items-center justify-center transition-all duration-500 ease-in-out"
          style={{
            width: `${animatedSize}px`,
            height: `${animatedSize}px`,
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

        <div className="absolute bottom-48 text-center">
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

      <div
        className={cn(
          'absolute bottom-20 z-10 flex space-x-2 transition-opacity duration-500',
          isAnimatingOut ? 'opacity-0' : 'opacity-100'
        )}
      >
        <div
          className="h-3 w-3 animate-bounce rounded-full bg-orange-500"
          style={{ animationDelay: '0s' }}
        ></div>
        <div
          className="h-3 w-3 animate-bounce rounded-full bg-teal-400"
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className="h-3 w-3 animate-bounce rounded-full bg-orange-400"
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
    </div>
  );
}
