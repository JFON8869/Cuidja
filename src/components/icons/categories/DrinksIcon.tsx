import { cn } from '@/lib/utils';
import React from 'react';

export const DrinksIcon = ({ className }: { className?: string }) => (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-10 w-10', className)}>
  <path d="M6 8L7.5 19.5C7.7 20.8 8.8 21.8 10.1 21.8H13.9C15.2 21.8 16.3 20.8 16.5 19.5L18 8" fill="#E0F7FA" stroke="#2C3E50" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M7 14L17 14L17.5 10H6.5L7 14Z" fill="#4FC3F7" opacity="0.6"/>
  <path d="M5 8H19" stroke="#2C3E50" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M15 8L17 2H13.5" stroke="#E74C3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="18" cy="6" r="3" fill="#C5E1A5" stroke="#2C3E50" stroke-width="1.2"/>
  <path d="M18 4V8M16 6H20" stroke="#2C3E50" stroke-width="0.8" stroke-linecap="round"/>
  <circle cx="10" cy="17" r="1" fill="white"/>
  <circle cx="13" cy="14" r="1" fill="white"/>
</svg>
);