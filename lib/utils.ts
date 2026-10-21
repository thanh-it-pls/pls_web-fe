import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

/** Generate a short unique `code` for new records, e.g. "card-k3j9x2". */
export const genCode = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/** Empty strings become null so optional API fields are cleared rather than set to "". */
export const nullable = (value: string): string | null => (value.trim() === "" ? null : value.trim());
