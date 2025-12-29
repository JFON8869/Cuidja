import { cn } from '@/lib/utils';
import React from 'react';

export const RestaurantIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('h-10 w-10', className)}
  >
    <path
      d="M3 20H21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M5 17C5 17 5 9 12 9C19 9 19 17 19 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 9V7C12 6.44772 11.5523 6 11 6H13C12.4477 6 12 6.44772 12 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M9 12C8 12.5 7.5 13.5 7.5 13.5"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);
