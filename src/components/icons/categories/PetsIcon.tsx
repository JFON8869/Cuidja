import { cn } from '@/lib/utils';
import React from 'react';

export const PetsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <filter id="shadow-pets" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
      </filter>
    </defs>
    <g filter="url(#shadow-pets)">
      {/* Dog house */}
      <path d="M20 90 V 50 L 50 20 L 80 50 V 90 H 20 Z" fill="#A0522D" />
      <path d="M15 55 L 50 15 L 85 55" fill="#CD5C5C" stroke="#8B0000" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="50" cy="35" r="8" fill="#F5F5DC" stroke="#A0522D" strokeWidth="2" />
      
      {/* Door */}
      <path d="M40 90 V 65 C 40 55, 60 55, 60 65 V 90" fill="#8B4513" />

      {/* Bone */}
       <g transform="translate(55 65) rotate(-30)">
        <circle cx="10" cy="10" r="5" fill="#F5DEB3" />
        <circle cx="25" cy="10" r="5" fill="#F5DEB3" />
        <rect x="10" y="5" width="15" height="10" fill="#F5DEB3" />
      </g>
    </g>
  </svg>
);