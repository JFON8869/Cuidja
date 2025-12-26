import { cn } from '@/lib/utils';
import React from 'react';

export const MarketIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <g>
      <path
        d="M 20 25 L 30 70 L 80 70 L 90 25"
        fill="none"
        stroke="#E76F51"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="30"
        y1="70"
        x2="25"
        y2="85"
        stroke="#E76F51"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="80"
        y1="70"
        x2="85"
        y2="85"
        stroke="#E76F51"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1="25"
        y1="85"
        x2="85"
        y2="85"
        stroke="#E76F51"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="45" cy="45" r="10" fill="#2A9D8F" />
      <path d="M 60 40 L 75 40 L 70 55 Z" fill="#F4A261" />
    </g>
  </svg>
);
