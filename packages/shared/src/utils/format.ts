import Decimal from "decimal.js";
import { roundTo5Rappen } from "./rounding.js";

/**
 * Format CHF amount with Swiss formatting: CHF 1'234.55
 */
export function formatChf(amount: Decimal | number | string): string {
	const rounded = roundTo5Rappen(amount);
	const parts = rounded.toFixed(2).split(".");
	const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
	return `CHF ${intPart}.${parts[1]}`;
}

/**
 * Validate Swiss IBAN (CH + 2 check digits + 17 alphanumeric).
 */
export function isValidSwissIban(iban: string): boolean {
	const cleaned = iban.replace(/\s/g, "").toUpperCase();
	if (!/^CH\d{2}[A-Z0-9]{17}$/.test(cleaned)) return false;
	return validateIbanChecksum(cleaned);
}

/**
 * Validate QR-IBAN (starts with CH, positions 5-9 in range 30000-31999).
 */
export function isQrIban(iban: string): boolean {
	const cleaned = iban.replace(/\s/g, "").toUpperCase();
	if (!isValidSwissIban(cleaned)) return false;
	const iid = parseInt(cleaned.substring(4, 9), 10);
	return iid >= 30000 && iid <= 31999;
}

function validateIbanChecksum(iban: string): boolean {
	const rearranged = iban.substring(4) + iban.substring(0, 4);
	const numericStr = rearranged
		.split("")
		.map((ch) => {
			const code = ch.charCodeAt(0);
			return code >= 65 ? (code - 55).toString() : ch;
		})
		.join("");
	let remainder = 0;
	for (const digit of numericStr) {
		remainder = (remainder * 10 + parseInt(digit, 10)) % 97;
	}
	return remainder === 1;
}

/**
 * Validate Swiss UID (Unternehmens-Identifikationsnummer): CHE-123.456.789
 */
export function isValidUid(uid: string): boolean {
	const cleaned = uid.replace(/[\s.-]/g, "").toUpperCase();
	return /^CHE\d{9}$/.test(cleaned);
}

/**
 * Format percentage with Swiss convention.
 */
export function formatPercent(rate: Decimal | number | string): string {
	return `${new Decimal(rate).toFixed(2)}%`;
}
