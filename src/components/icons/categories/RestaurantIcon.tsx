import { cn } from '@/lib/utils';
import React from 'react';

export const RestaurantIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11,2V22C5.9,21.5 2,17.1 2,12C2,6.9 5.9,2.5 11,2M13,2C18.1,2.5 22,6.9 22,12C22,17.1 18.1,21.5 13,22V2Z" />
  </svg>
);
