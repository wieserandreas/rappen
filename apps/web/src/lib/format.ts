/**
 * Display formatting helpers for the web app.
 * All values use Swiss formatting conventions.
 */

/**
 * Format a CHF amount with Swiss thousand separators (apostrophes).
 * Example: 12345.5 → "12'345.50"
 */
export function formatChf(value: string | number): string {
	const num = typeof value === "string" ? parseFloat(value) : value;
	if (isNaN(num)) return "—";
	const parts = num.toFixed(2).split(".");
	const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
	return `${intPart}.${parts[1]}`;
}

/**
 * Format with CHF prefix.
 */
export function formatChfPrefixed(value: string | number): string {
	return `CHF ${formatChf(value)}`;
}

/**
 * Format a percentage with Swiss conventions.
 */
export function formatPercent(value: string | number, decimals = 2): string {
	const num = typeof value === "string" ? parseFloat(value.replace("%", "")) : value;
	if (isNaN(num)) return "—";
	return `${num.toFixed(decimals)}%`;
}

/**
 * Format an integer with thousand separators.
 */
export function formatNumber(value: number): string {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}
