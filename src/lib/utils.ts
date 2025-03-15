
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add the missing formatTimeAgo function for DifficultyContinueCard
export function formatTimeAgo(timestamp: number | undefined): string {
  if (!timestamp) return 'Never played';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  // Convert to seconds
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return 'Just now';
  }
  
  // Convert to minutes
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Convert to hours
  const hours = Math.floor(minutes / 60);
  
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Convert to days
  const days = Math.floor(hours / 24);
  
  if (days < 30) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Convert to months
  const months = Math.floor(days / 30);
  
  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  // Convert to years
  const years = Math.floor(months / 12);
  
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}
