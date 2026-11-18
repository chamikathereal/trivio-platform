import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format minor currency units (e.g. 1000000n cents -> "$10,000.00")
 */
export function formatMinorUnits(minorUnits: bigint | number, currency: string = "USD"): string {
  const value = Number(minorUnits) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format basis points to percentage string (e.g. 250 bps -> "2.50%")
 */
export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}
