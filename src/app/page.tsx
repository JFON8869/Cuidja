
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/welcome');
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [router]);
  
  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-sm flex-col overflow-hidden bg-gradient-to-b from-blue-100 via-orange-100 to-orange-200 shadow-2xl">
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative flex h-full w-full flex-col items-center justify-center px-8">
          
          {/* Hexagonal Container */}
          <div className="relative">
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
                
                {/* Logo Image */}
                <div className="w-36 h-36 mb-6 flex items-center justify-center bg-gradient-to-br from-white/40 to-white/20 rounded-3xl backdrop-blur-sm shadow-lg border border-white/30">
                  <img 
                    src="/logo.svg" 
                    alt="Cuidja Logo" 
                    className="w-full h-full object-contain p-3"
                    style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'}}
                  />
                </div>
                
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
          
          {/* Loading Animation */}
          <div className="absolute bottom-20 flex space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

