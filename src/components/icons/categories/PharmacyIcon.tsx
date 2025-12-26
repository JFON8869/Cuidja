import { cn } from '@/lib/utils';
import React from 'react';

export const PharmacyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <circle cx="50" cy="50" r="40" fill="#A8D5BA" />
      <rect x="42" y="25" width="16" height="50" fill="white" rx="5" />
      <rect x="25" y="42" width="50" height="16" fill="white" rx="5" />
    </g>
  </svg>
);
