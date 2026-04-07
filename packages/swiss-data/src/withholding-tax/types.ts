import type { CantonCode, TariffCode } from "@rappen/shared";

/**
 * Compact bracket tuple: [from, rate, min_tax].
 *
 * - `from`: lower income bound in CHF (inclusive)
 * - `rate`: effective tax rate in percent
 * - `min_tax`: minimum tax in CHF (Mindeststeuer); 0 if not applicable
 *
 * The implicit upper bound is the next bracket's `from`. The last bracket
 * extends to infinity. The list is always sorted ascending by `from`.
 *
 * Source: ESTV "Aufbau und Recordformate der Quellensteuer-Tarife", section 3.3.
 */
export type CompactBracket = [from: number, rate: number, min_tax: number];

/**
 * One full tariff series for a (canton, tariff group, child count, church) tuple.
 */
export interface CompactTariffSeries {
	/** Tariff group letter — A, B, C, D, E, H, L, M, N, P, R, S, T, U */
	g: string;
	/** Number of children (0–9) */
	c: number;
	/** Church tax: true if "Y", false if "N" */
	k: boolean;
	/** Compact brackets, sorted ascending */
	b: CompactBracket[];
}

/**
 * Complete tariff data for one canton, one year.
 */
export interface CantonTariffData {
	canton: string;
	year: number;
	created_at: string;
	source: string;
	notes: string;
	median_salary: number | null;
	/** Tariffs keyed by full code (e.g. "A0N", "B2Y", "H1N") */
	tariffs: Record<string, CompactTariffSeries>;
}

/**
 * Build the full tariff lookup key from a tariff group, child count, and church flag.
 * Mirrors the ESTV record format (Recordart 06, field 4 "QSt-Code").
 */
export function buildEstvCode(
	group: TariffCode | "L" | "M" | "N" | "P" | "R" | "S" | "T" | "U",
	children: number,
	church: boolean,
): string {
	const childChar = Math.max(0, Math.min(9, children)).toString();
	const churchChar = church ? "Y" : "N";
	return `${group}${childChar}${churchChar}`;
}
