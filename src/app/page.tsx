'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SplashPage() {
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const sequence = [
      { delay: 500, nextStep: 1 },
      { delay: 150, nextStep: 2 },
      { delay: 400, nextStep: 3 },
      { delay: 350, nextStep: 4 },
      { delay: 250, nextStep: 5 },
      { delay: 300, nextStep: 6 },
      { delay: 600, nextStep: 7 },
      { delay: 350, action: () => router.push('/welcome') },
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
      case 0: return 'scale-100'; 
      case 1: return 'scale-105'; // Anticipation
      case 2: return 'scale-20';  // Contraction
      case 3: return 'scale-90';  // Bounce back up
      case 4: return 'scale-105'; // Overshoot
      case 5: return 'scale-100'; // Settle
      case 6: return 'scale-100'; // Pause
      case 7: return 'scale-[3]'; // Final expansion
      default: return 'scale-100';
    }
  };
  
  const isFinalStep = animationStep >= 7;

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-100 via-orange-100 to-orange-200 shadow-2xl">
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

       <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className={cn(
          'absolute h-36 w-36 object-contain transition-transform duration-500 ease-in-out',
          getLogoScaleClass()
        )}
        style={{
          width: animationStep === 7 ? '100vw' : undefined,
          height: animationStep === 7 ? '100vh' : undefined,
        }}
      >
        <path fill="#e6801d" d="M89 32 50 9l-39 23v46l39 23 39-23z" />
        <path
          fill="#d1d1d1"
          d="m81.9 66-15-18.1-13.4 15.3L37 77.8V35.6l23.5-13.6 21.4 12.3z"
        />
        <path
          fill="#b8b8b8"
          d="m50 22-23.5 13.6V77.8l16.5-14.6 17-19.4L81.9 30z"
        />
        <path fill="#e6801d" d="m50 43.8-13.5 15.4L50 71.4l13.5-12.2z" />
        <path fill="#f29435" d="m50 43.8 13.5 15.4L50 71.4 36.5 59.2z" />
        <path
          fill="#e6801d"
          d="M50 43.8c-1.5-1.8-3-3.4-4.2-5.3-2.1-3-3.2-6.5-2.2-9.9 1.1-3.6 4.3-6.5 8.1-7.1 4.5-.6 8.3 2.5 9.4 6.7.8 3-2.2 7-2.2 7l-11.1 8.6z"
        />
        <path
          fill="#f29435"
          d="M50 43.8c1.5-1.8 3-3.4 4.2-5.3 2.1-3 3.2-6.5 2.2-9.9-1.1-3.6-4.3-6.5-8.1-7.1-4.5-.6-8.3 2.5-9.4 6.7-.8 3 2.2 7 2.2 7l11.1 8.6z"
        />
        <path
          fill="#3e8c73"
          d="M36.5 59.2h27v2.8h-27zM36.5 63.4h27v2.8h-27z"
        />
      </svg>


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
  );
}
