import { cn } from '@/lib/utils';
import React from 'react';

export const DrinksIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.5,8H20V6H14.5V8M11,2H9V3.13C6.15,3.64 4,6.55 4,9.8V19C4,20.1 4.9,21 6,21H18C19.1,21 20,20.1 20,19V9.8C20,6.55 17.85,3.64 15,3.13V2H13V3.07C12.3,3.03 11.63,3 11,3C10.04,3 9.1,3.12 8.2,3.34L11,2M6,19V9.8C6,7.53 7.55,5.55 9.75,5.13C9.3,6.33 9,7.63 9,9C9,11.33 9.8,13.43 11.24,15H6V19Z"
    />
  </svg>
);
