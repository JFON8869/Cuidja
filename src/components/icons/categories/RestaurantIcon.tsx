import { cn } from '@/lib/utils';
import React from 'react';

export const RestaurantIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('h-10 w-10', className)}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <g strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      {/* Plate */}
      <circle cx="50" cy="50" r="28" fill="#78C2A5" stroke="none" />
      <circle cx="50" cy="50" r="16" fill="#E86A5D" stroke="none" />
      
      {/* Plate Arcs */}
      <path d="M28 25 A 35 35 0 0 1 72 25" fill="none" stroke="#F4B164" />
      <path d="M28 75 A 35 35 0 0 0 72 75" fill="none" stroke="#F4B164" />

      {/* Fork */}
      <g stroke="#3D4144">
        <path d="M15 80 C 15 70, 25 65, 25 50 V 20" fill="none" />
        <path d="M15 80 L 15 90 A 5 5 0 0 0 20 95 H 30 A 5 5 0 0 0 35 90 L 35 80" fill="#F4B164" stroke="none" />
        <path d_fork_tines="M 15 28 C 15 20, 20 20, 20 20 M 35 28 C 35 20, 30 20, 30 20 M 25 20 V 35" fill="none" />
      </g>
      
      {/* Knife */}
      <g stroke="#3D4144">
        <path d="M75 80 L 75 90 A 5 5 0 0 1 70 95 H 80 A 5 5 0 0 1 85 90 L 85 80" fill="#F4B164" stroke="none"/>
        <path d="M75 80 V 25 C 75 15, 90 15, 90 25 L 75 45 Z" fill="#3D4144" stroke="none" />
        <path d="M78 55 L 78 65" stroke="white" strokeWidth="4" />
      </g>
    </g>
  </svg>
);