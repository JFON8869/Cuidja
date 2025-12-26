import { cn } from '@/lib/utils';
import React from 'react';

export const MarketIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <filter id="shadow-market" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
      </filter>
    </defs>
    <g filter="url(#shadow-market)">
      {/* Bag */}
      <path
        d="M20 35 L 25 85 H 75 L 80 35 H 20 Z"
        fill="#D2B48C"
      />
      <path
        d="M20 35 L 25 85"
        fill="none"
        stroke="#A0522D"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />
       <path
        d="M80 35 L 75 85"
        fill="none"
        stroke="#A0522D"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />

      {/* Handles */}
      <path
        d="M35 35 C 35 15, 45 15, 45 35"
        stroke="#A0522D"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
       <path
        d="M55 35 C 55 15, 65 15, 65 35"
        stroke="#A0522D"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Vegetables */}
      <g>
        {/* Lettuce */}
        <circle cx="50" cy="40" r="15" fill="#6B8E23" />
        <circle cx="45" cy="35" r="12" fill="#8FBC8F" />
        <circle cx="55" cy="35" r="12" fill="#8FBC8F" />
        <circle cx="50" cy="30" r="10" fill="#9ACD32" />

        {/* Carrot */}
        <path d="M65 45 L 70 30 L 75 45 Z" fill="#FFA500" />
        <path d="M68 30 L 65 25 L 72 28 Z" fill="#32CD32" />
      </g>
    </g>
  </svg>
);