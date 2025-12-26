import { cn } from '@/lib/utils';
import React from 'react';

export const RestaurantIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.5" stroke="#3D4144">
      {/* Fork */}
      <path
        d="M26 80V45 M26 35 C 26 25, 18 25, 18 35 M26 35 C 26 25, 34 25, 34 35 M26 22 V 35"
        fill="none"
      />
      <path
        d="M21 80 H 31 V 50 C 31 45, 21 45, 21 50 V 80 Z"
        fill="#F4B164"
      />

      {/* Knife */}
      <path
        d="M74 80 V 35 C 74 25, 82 25, 82 35 L 74 80 Z"
        fill="#F4B164"
      />
       <path
        d="M74 45 L 82 45"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="butt"
      />

      {/* Plate and Arcs */}
      <g stroke="none">
        <path d="M 50 18 A 28 28 0 0 0 50 82" fill="none" stroke="#F4B164" strokeWidth="5"/>
        <circle cx="50" cy="50" r="22" fill="#78C2A5" />
        <circle cx="50" cy="50" r="15" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="12" fill="#E86A5D" />
      </g>
    </g>
  </svg>
);
