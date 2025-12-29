import { cn } from '@/lib/utils';
import React from 'react';

export const GasWaterIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8,4A4,4 0 0,0 4,8A4,4 0 0,0 8,12A4,4 0 0,0 12,8A4,4 0 0,0 8,4M16,4.07C18.45,4.56 20.33,6.62 20.9,9H18.78C18.25,7.5 17.25,6.5 16,6.07V4.07M8,14C4.69,14 2,16.69 2,20C2,22.21 3.79,24 6,24H10C12.21,24 14,22.21 14,20C14,16.69 11.31,14 8,14Z" />
  </svg>
);
