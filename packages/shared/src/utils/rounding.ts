import Decimal from "decimal.js";

/**
 * Swiss 5-Rappen rounding: rounds to the nearest 0.05 CHF.
 * Uses decimal.js to avoid floating-point errors.
 */
export function roundTo5Rappen(amount: Decimal | number | string): Decimal {
	const d = new Decimal(amount);
	return d.mul(20).round().div(20);
}

/**
 * Round to 2 decimal places (for intermediate calculations).
 */
export function roundTo2(amount: Decimal | number | string): Decimal {
	const d = new Decimal(amount);
	return d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/**
 * Format a Decimal as CHF string with 5-Rappen rounding applied.
 */
export function toChf(amount: Decimal | number | string): string {
	return roundTo5Rappen(amount).toFixed(2);
}

/**
 * Safe percentage calculation: (amount * rate / 100), rounded to 2 decimals.
 */
export function percentOf(amount: Decimal | number | string, rate: Decimal | number | string): Decimal {
	return new Decimal(amount).mul(new Decimal(rate)).div(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}
