import { cn } from '@/lib/utils';
import React from 'react';

export const RestaurantIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('h-10 w-10', className)}
  >
    <rect
      x="20"
      y="45"
      width="60"
      height="45"
      fill="#FFD54F"
      stroke="#1A1A1A"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    <rect
      x="46"
      y="50"
      width="30"
      height="20"
      fill="#E3F2FD"
      stroke="#1A1A1A"
      strokeWidth="2.5"
    />
    <rect
      x="52"
      y="76"
      width="18"
      height="4"
      rx="1"
      fill="#42A5F5"
      stroke="#1A1A1A"
      strokeWidth="2"
    />

    <rect
      x="25"
      y="50"
      width="16"
      height="35"
      fill="#A1887F"
      stroke="#1A1A1A"
      strokeWidth="2.5"
    />
    <rect
      x="29"
      y="55"
      width="8"
      height="10"
      fill="#FFF"
      stroke="#1A1A1A"
      strokeWidth="1.5"
    />
    <rect
      x="29"
      y="70"
      width="8"
      height="10"
      fill="#FFF"
      stroke="#1A1A1A"
      strokeWidth="1.5"
    />

    <path
      d="M15 45 L25 15 L35 15 L35 45 Z"
      fill="#EF5350"
      stroke="#1A1A1A"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M35 45 L35 15 L50 15 L50 45 Z"
      fill="#42A5F5"
      stroke="#1A1A1A"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M50 45 L50 15 L65 15 L75 45 Z"
      fill="#EF5350"
      stroke="#1A1A1A"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    <path
      d="M15 45 Q22.5 52 30 45 Q37.5 52 45 45 Q52.5 52 60 45 Q67.5 52 75 45 Q82.5 52 85 45"
      stroke="#1A1A1A"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M15 45 Q22.5 52 30 45 Q37.5 52 45 45 Q52.5 52 60 45 Q67.5 52 75 45 Q82.5 52 85 45"
      fill="#66BB6A"
      fillOpacity="0.3"
    />

    <path
      d="M68 55 V65 H75 V58 C75 56 73 55 72 55 H68Z"
      fill="#42A5F5"
      stroke="#1A1A1A"
      strokeWidth="1.5"
    />
    <path
      d="M52 58 L57 63 L62 58 M57 63 V68 M54 68 H60"
      stroke="#EF5350"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);