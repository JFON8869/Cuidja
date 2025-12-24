
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SplashPage() {
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Defines the sequence of animation steps with refined professional timing
    const sequence = [
      { delay: 500, nextStep: 1 }, // Step 0: Initial state, wait 500ms
      { delay: 450, nextStep: 2 }, // Step 1: Contraction, increased from 300ms
      { delay: 300, nextStep: 3 }, // Step 2: Pause at smallest size, increased from 200ms
      { delay: 450, nextStep: 4 }, // Step 3: Expansion back to normal, increased from 300ms
      { delay: 800, nextStep: 5 }, // Step 4: Pause before final expansion, wait 800ms
      { delay: 1000, action: () => router.push('/welcome') }, // Step 5: Redirect after final animation
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
      case 0:
        return 'scale-100'; // Initial size
      case 1:
        return 'scale-70'; // First contraction
      case 2:
        return 'scale-60'; // Second contraction (smallest point)
      case 3:
        return 'scale-100'; // Return to initial size
      case 4:
      case 5: // Keep scaled up during the final delay and redirection
        return 'scale-[10]'; // Expand to fill screen
      default:
        return 'scale-100';
    }
  };
  
  const isFinalStep = animationStep >= 4;

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
