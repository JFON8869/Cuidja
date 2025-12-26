import { cn } from '@/lib/utils';
import React from 'react';

export const RestaurantIcon = ({ className }: { className?: string }) => (
  <svg
    width="512"
    height="512"
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('h-10 w-10', className)}
    preserveAspectRatio="xMidYMid meet"
  >
    <circle cx="256" cy="256" r="240" fill="#FF5722" />
    <circle cx="256" cy="270" r="140" fill="white" />
    <circle
      cx="256"
      cy="270"
      r="110"
      fill="#F5F5F5"
      stroke="#E0E0E0"
      strokeWidth="2"
    />
    <path
      d="M180 200V280C180 300 195 315 210 315V420"
      stroke="#333"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <line
      x1="195"
      y1="200"
      x2="195"
      y2="260"
      stroke="#333"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <line
      x1="210"
      y1="200"
      x2="210"
      y2="260"
      stroke="#333"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <path
      d="M330 200C330 200 300 200 300 280V315H315V420"
      fill="#333"
      stroke="#333"
      strokeWidth="8"
    />
  </svg>
);
