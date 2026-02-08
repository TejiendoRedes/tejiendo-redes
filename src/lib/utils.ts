import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function createResponse<T>(success: boolean, data?: T, error?: string): APIResponse<T> {
  return { success, data, error };
}

