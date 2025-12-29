import { cn } from '@/lib/utils';
import React from 'react';

export const CraftsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.71,5.63L18.37,3.29C18,2.9,17.35,2.9,16.96,3.29L12,8.25L10.25,6.5L5,11.75L3.5,10.25L2.25,11.5L6.5,15.75L7.75,14.5L6.25,13L11,8.25L15.75,13L18.13,10.61C19.3,9.44 21.03,8.03 21.37,7.63C22.15,6.85 21.48,5.63 20.71,5.63Z" />
  </svg>
);
