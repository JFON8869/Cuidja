import { cn } from '@/lib/utils';
import React from 'react';

export const PetsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.5,8 6,8.5 6,9V11.5C6,14.5 8.5,17 11.5,17H12.5C15.5,17 18,14.5 18,11.5V9C18,8.5 18.5,8 19,8C19.5,8 20,8.5 20,9V11.5C20,15.38 16.88,18.5 13,18.5H11C7.12,18.5 4,15.38 4,11.5V9C4,8.5 4.5,8 5,8Z" />
  </svg>
);
