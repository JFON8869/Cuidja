import { cn } from '@/lib/utils';
import React from 'react';

export const ServicesIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#FFA500"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10,8V4H14V8H10M16,8V4H20V8H16M10,14V10H14V14H10M16,14V10H20V14H16M4,14V10H8V14H4M4,20V16H8V20H4M10,20V16H14V20H10M16,20V16H20V20H16M4,8V4H8V8H4Z" />
  </svg>
);
