import { cn } from '@/lib/utils';
import React from 'react';

export const PetsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6,14C6,14 3,14 3,16.5C3,19 5.5,21 8,21C10.5,21 12,19.5 12,19.5V14M6,14V11.5C6,9 8,7 10,7H12V10L17.5,8.5L18,11L13.5,12.5V20.5C13.5,20.5 14.5,22 16.5,22C18.5,22 21,20 21,17.5C21,15 18,14 18,14H12V7L11.5,6.5L10,7L10.5,8L11,7.5V2L10,3L9,2L9.5,3.5L8.5,4.5L7.5,3.5L6,5V11.5Z"
    />
  </svg>
);
