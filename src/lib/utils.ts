import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type OperatingHours, type DayOfWeek } from "@/lib/data";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
}

export function isStoreOpen(operatingHours?: OperatingHours): boolean {
  if (!operatingHours) {
    return false; // Assume closed if no hours are set
  }

  const now = new Date();
  const dayOfWeek = now.toLocaleString('en-US', { weekday: 'short' }).toLowerCase() as DayOfWeek; // e.g., 'mon'
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes from midnight

  const todaysHours = operatingHours[dayOfWeek];

  if (!todaysHours || !todaysHours.isOpen) {
    return false;
  }

  const [openHour, openMinute] = todaysHours.open.split(':').map(Number);
  const openTime = openHour * 60 + openMinute;

  const [closeHour, closeMinute] = todaysHours.close.split(':').map(Number);
  const closeTime = closeHour * 60 + closeMinute;

  // Handle overnight hours where closeTime is on the next day
  if (closeTime < openTime) {
    // If current time is after open time OR before close time (on the next day)
    return currentTime >= openTime || currentTime < closeTime;
  }

  return currentTime >= openTime && currentTime < closeTime;
}
