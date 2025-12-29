import { cn } from '@/lib/utils';
import React from 'react';

export const PharmacyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13,5.5C14.04,5.5 14.99,6.08 15.5,7H17V9H15.5C14.99,9.92 14.04,10.5 13,10.5C11.96,10.5 11.01,9.92 10.5,9H9V7H10.5C11.01,6.08 11.96,5.5 13,5.5M13,3C10.24,3 8,5.24 8,8C8,10.76 10.24,13 13,13C15.76,13 18,10.76 18,8C18,5.24 15.76,3 13,3M19,16V14H6V16H19M21,11H5C3.9,11 3,11.9 3,13V21H23V13C23,11.9 22.1,11 21,11Z"
    />
  </svg>
);
