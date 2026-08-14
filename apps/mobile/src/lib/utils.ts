import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS class names.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 * @example
 * ```ts
 * cn("px-4 py-2", isActive && "bg-primary", "px-6")
 * // Returns: "py-2 bg-primary px-6" (px-4 gets overwritten by px-6)
 * ```
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
