import { cn } from '@/lib/utils';
import React from 'react';

export const ServicesIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="rotate(-30 50 50)">
      {/* Wrench */}
      <path
        d="M 20 30 C 10 20 10 10 20 10 C 30 10 30 20 20 30 Z"
        fill="#E76F51"
      />
      <rect x="18" y="30" width="50" height="8" rx="4" fill="#E76F51" />
      <path
        d="M 68 30 C 78 20 78 10 68 10 C 58 10 58 20 68 30 Z"
        fill="none"
        stroke="#E76F51"
        strokeWidth="6"
      />

      {/* Screwdriver */}
      <rect
        x="30"
        y="60"
        width="60"
        height="12"
        rx="6"
        fill="#2A9D8F"
        transform="rotate(20 50 65)"
      />
      <rect
        x="15"
        y="58"
        width="15"
        height="16"
        fill="#264653"
        transform="rotate(20 50 65)"
      />
    </g>
  </svg>
);
