'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SplashPage() {
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const sequence = [
      { delay: 750, nextStep: 1 }, // Initial pause (500 * 1.5)
      { delay: 225, nextStep: 2 }, // Anticipation (grow) (150 * 1.5)
      { delay: 600, nextStep: 3 }, // Main action (shrink) (400 * 1.5)
      { delay: 525, nextStep: 4 }, // Settle 1 (grow back) (350 * 1.5)
      { delay: 375, nextStep: 5 }, // Settle 2 (overshoot) (250 * 1.5)
      { delay: 450, nextStep: 6 }, // Final settle (300 * 1.5)
      { delay: 900, nextStep: 7 }, // Pause before final action (600 * 1.5)
      { delay: 525, action: () => router.push('/welcome') }, // (350 * 1.5)
    ];

    let currentTimeout: NodeJS.Timeout;

    const runAnimation = (step: number) => {
      if (step >= sequence.length) return;
      const { delay, nextStep, action } = sequence[step];

      currentTimeout = setTimeout(() => {
        if (action) {
          setAnimationStep(step);
          action();
        } else if (nextStep !== undefined) {
          setAnimationStep(nextStep);
          runAnimation(nextStep);
        }
      }, delay);
    };

    runAnimation(0);

    return () => clearTimeout(currentTimeout);
  }, [router]);

  const getLogoScaleClass = () => {
    switch (animationStep) {
      case 0: return 'scale-100'; // Start at normal size
      case 1: return 'scale-105'; // 1. Anticipation
      case 2: return 'scale-20';  // 2. Contraction
      case 3: return 'scale-90';  // 3. Bounce back up (part 1)
      case 4: return 'scale-105'; // 4. Overshoot
      case 5: return 'scale-100'; // 5. Settle at original size
      case 6: return 'scale-100'; // 6. Pause
      case 7: return 'scale-[3]'; // 7. Final expansion (to 30% of screen)
      default: return 'scale-100';
    }
  };

  const isFinalStep = animationStep >= 7;

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col justify-center overflow-hidden bg-gradient-to-b from-blue-100 via-orange-100 to-orange-200 shadow-2xl">
      <div className={cn("relative flex flex-col items-center justify-center transition-transform duration-500", isFinalStep ? 'transform-none' : '-translate-y-[70%]')}>
        <div className={cn('relative flex h-80 w-72 flex-col items-center justify-between p-8 transition-opacity duration-500', isFinalStep ? 'opacity-0' : 'opacity-100')}>
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
          <h1
              className="absolute top-5 -translate-y-[70%] text-7xl font-black tracking-tight"
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
            <p
              className="absolute bottom-8 text-sm font-bold uppercase tracking-widest text-gray-900"
              style={{
                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                letterSpacing: '0.1em',
              }}
            >
              O seu comércio local
            </p>
        </div>

        <img
          src="/logo.svg"
          alt="Cuidja Logo"
          className={cn(
            'absolute h-36 w-36 object-contain transition-transform duration-500 ease-in-out',
            getLogoScaleClass()
          )}
        />
      </div>

      <div
        className={cn(
          'absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2 transition-opacity duration-500',
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
  );
}
