import { cn } from '@/lib/utils';
import React from 'react';

export const DrinksIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11,9L12.42,10.42C12.21,10.79 12,11.21 12,11.66V18H6V11.66C6,11.21 6.21,10.79 6.58,10.42L8,9H11M11,2L6,7V9H13V7L8,2H11Z" />
  </svg>
);
