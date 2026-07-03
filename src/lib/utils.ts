import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function createResponse<T>(success: boolean, data?: T, messageOrError?: string): APIResponse<T> {
  // BUG-15 FIX: When success is true, the third arg is a message. When false, it's an error.
  if (success) {
    return { success, data, message: messageOrError };
  }
  return { success, data, error: messageOrError };
}

