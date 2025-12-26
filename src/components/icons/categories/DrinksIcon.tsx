import { cn } from '@/lib/utils';
import React from 'react';

export const DrinksIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <g transform="rotate(10 50 50)">
      <rect x="35" y="15" width="30" height="10" rx="5" fill="#8A6E59" />
      <path
        d="M 40 25 L 60 25 L 65 85 L 35 85 Z"
        fill="#5E96C3"
        stroke="#FFFFFF"
        strokeWidth="3"
      />
      <rect x="30" y="50" width="40" height="20" rx="5" fill="#F4A261" />
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
      >
        DRINK
      </text>
    </g>
  </svg>
);
