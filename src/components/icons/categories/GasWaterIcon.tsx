import { cn } from '@/lib/utils';
import React from 'react';

export const GasWaterIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18,14H16V11H14V14H12V11H10V14H8V10C8,8.9 8.9,8 10,8H16C17.1,8 18,8.9 18,10V14M6,22H18C19.1,22 20,21.1 20,20V10C20,7.79 18.21,6 16,6H10C7.79,6 6,7.79 6,10V22M4,16H2V10C2,6.69 4.69,4 8,4H16C17.04,4 18.05,4.21 18.97,4.6L17.5,6.07C17.03,6.03 16.53,6 16,6H8C5.79,6 4,7.79 4,10V16Z"
    />
  </svg>
);
