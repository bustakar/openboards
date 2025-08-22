import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');
  if (parts.length < 2) return null;
  
  // Handle localhost development
  if (hostname.includes('localhost')) {
    if (parts.length === 2) {
      // Check if it's just localhost or has a subdomain
      if (parts[0] === 'localhost') return null; // localhost:3000
      return parts[0]; // demo.localhost:3000
    }
    if (parts.length >= 3) return parts[0]; // demo.localhost:3000, demo.localhost
  }
  
  // Handle production domains
  if (parts.length === 3) return parts[0]; // demo.openboards.co
  return null;
}
