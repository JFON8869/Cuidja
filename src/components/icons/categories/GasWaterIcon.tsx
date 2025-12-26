import { cn } from '@/lib/utils';
import React from 'react';

export const GasWaterIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <rect x="25" y="30" width="50" height="60" rx="10" fill="#E76F51" />
      <rect x="35" y="20" width="30" height="10" rx="5" fill="#264653" />
      <path
        d="M 65 50 C 65 40 75 40 75 50 C 75 60 65 60 65 50"
        fill="#F4A261"
      />
      <path
        d="M 65 70 C 65 60 75 60 75 70 C 75 80 65 80 65 70"
        fill="#F4A261"
      />
      <path
        d="M 20 15 C 20 5 40 5 40 15 C 40 25 30 25 30 35 S 20 25 20 15 Z"
        fill="#5E96C3"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
    </g>
  </svg>
);
