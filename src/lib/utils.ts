import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges class names, letting later Tailwind utilities win over earlier ones. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatNumber = (value: number | null | undefined, digits = 1) =>
  value === null || value === undefined || Number.isNaN(value)
    ? "—"
    : value.toFixed(digits);

/** "3 min ago" — relative time without pulling in a date library. */
export const timeAgo = (input: string | Date): string => {
  const then = new Date(input).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);

  if (seconds < 45) return "just now";
  const units: [number, string][] = [
    [60, "min"],
    [3600, "hr"],
    [86400, "day"],
    [604800, "week"],
  ];

  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} d ago`;
  void units;
  return new Date(input).toLocaleDateString();
};
