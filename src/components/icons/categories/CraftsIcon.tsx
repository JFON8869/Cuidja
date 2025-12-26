import { cn } from '@/lib/utils';
import React from 'react';

export const CraftsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <g>
      <path
        d="M 50 15 C 20 20 20 80 50 85 C 80 80 80 20 50 15 Z"
        fill="#F4A261"
      />
      <circle cx="35" cy="40" r="8" fill="#E76F51" />
      <circle cx="65" cy="40" r="8" fill="#2A9D8F" />
      <circle cx="50" cy="65" r="8" fill="#264653" />
      <path
        d="M 70 10 L 75 30 L 90 25 Z"
        fill="#8A6E59"
        transform="rotate(15 75 25)"
      />
      <rect
        x="73"
        y="30"
        width="5"
        height="15"
        fill="#C4C4C4"
        transform="rotate(15 75 25)"
      />
    </g>
  </svg>
);
