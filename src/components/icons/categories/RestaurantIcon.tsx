import { cn } from '@/lib/utils';
import React from 'react';

export const RestaurantIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16,5V11H21V5M21,3A2,2 0 0,1 23,5V11A2,2 0 0,1 21,13H16V21H14V3H21M11,8V10H9V8M11,5V7H9V5M7,8V10H5V8M7,5V7H5V5M3,8V10H1V8M3,5V7H1V5M11,3H9V1H11V3M7,3H5V1H7V3M3,3H1V1H3V3Z"
    />
  </svg>
);
