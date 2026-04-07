import clsx, { type ClassValue } from "clsx";

/**
 * Conditional className helper.
 * Combines class strings, filters falsy values.
 */
export function cn(...inputs: ClassValue[]): string {
	return clsx(inputs);
}
