import { cn } from '@/lib/utils';
import React from 'react';

export const DrinksIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className={cn('h-10 w-10', className)}
  >
    <rect
      x="80"
      y="180"
      width="352"
      height="260"
      fill="#FFD54F"
      stroke="#000"
      strokeWidth="20"
      strokeLinejoin="round"
    />

    <rect
      x="230"
      y="210"
      width="170"
      height="130"
      fill="#E1F5FE"
      stroke="#000"
      strokeWidth="15"
      strokeLinejoin="round"
    />

    <rect
      x="110"
      y="210"
      width="90"
      height="230"
      fill="#8D6E63"
      stroke="#000"
      strokeWidth="15"
      strokeLinejoin="round"
    />
    <rect
      x="130"
      y="240"
      width="50"
      height="60"
      fill="#FFF"
      stroke="#000"
      strokeWidth="10"
    />
    <rect
      x="130"
      y="330"
      width="50"
      height="60"
      fill="#FFF"
      stroke="#000"
      strokeWidth="10"
    />

    <path
      d="M60 180 L100 60 L200 60 L200 180 Z"
      fill="#EF5350"
      stroke="#000"
      strokeWidth="20"
      strokeLinejoin="round"
    />
    <rect
      x="200"
      y="60"
      width="112"
      height="120"
      fill="#42A5F5"
      stroke="#000"
      strokeWidth="20"
      strokeLinejoin="round"
    />
    <path
      d="M312 60 L412 60 L452 180 L312 180 Z"
      fill="#EF5350"
      stroke="#000"
      strokeWidth="20"
      strokeLinejoin="round"
    />

    <path
      d="M60 180 Q109 230 158 180 Q207 230 256 180 Q305 230 354 180 Q403 230 452 180"
      fill="#66BB6A"
      stroke="#000"
      strokeWidth="20"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M260 250 L280 280 L300 250 Z"
      fill="none"
      stroke="#EF5350"
      strokeWidth="8"
    />
    <line
      x1="280"
      y1="280"
      x2="280"
      y2="300"
      stroke="#EF5350"
      strokeWidth="8"
      strokeLinecap="round"
    />
    <rect
      x="330"
      y="240"
      width="40"
      height="70"
      rx="5"
      fill="#42A5F5"
      stroke="#000"
      strokeWidth="10"
    />
  </svg>
);
