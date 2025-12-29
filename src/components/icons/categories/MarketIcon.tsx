import { cn } from '@/lib/utils';
import React from 'react';

export const MarketIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12,3L2,12V21H22V12L12,3M19,19H5V13.5L12,7.2L19,13.5V19M12,17A2,2 0 0,1 10,15A2,2 0 0,1 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17Z" />
  </svg>
);
