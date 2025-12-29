import { cn } from '@/lib/utils';
import React from 'react';

export const MarketIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12,3L2,12V21H22V12L12,3M12,7.7L18,12.5V19H6V12.5L12,7.7M12,13C10.9,13 10,12.1 10,11C10,9.9 10.9,9 12,9C13.1,9 14,9.9 14,11C14,12.1 13.1,13 12,13Z"
    />
  </svg>
);
