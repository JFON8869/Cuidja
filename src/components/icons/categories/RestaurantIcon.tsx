import { cn } from '@/lib/utils';
import React from 'react';

export const RestaurantIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <g>
      <path
        d="M 80 45 A 20 20 0 0 0 50 25 A 20 20 0 0 0 20 45 L 80 45"
        fill="#D29A67"
      />
      <rect x="20" y="45" width="60" height="10" fill="#E84D44" />
      <path
        d="M 20 55 C 20 60 25 65 30 65 L 70 65 C 75 65 80 60 80 55 L 20 55"
        fill="#90C35B"
      />
      <rect x="20" y="65" width="60" height="10" rx="5" fill="#D29A67" />
    </g>
  </svg>
);
