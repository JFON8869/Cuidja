import { cn } from '@/lib/utils';
import React from 'react';

export const PetsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <g>
      <path
        d="M 50 40 C 30 40 20 60 25 75 C 30 90 70 90 75 75 C 80 60 70 40 50 40"
        fill="#E76F51"
      />
      <circle cx="30" cy="35" r="12" fill="#F4A261" />
      <circle cx="70" cy="35" r="12" fill="#F4A261" />
      <circle cx="50" cy="25" r="12" fill="#F4A261" />
      <circle cx="18" cy="60" r="10" fill="#F4A261" />
    </g>
  </svg>
);
