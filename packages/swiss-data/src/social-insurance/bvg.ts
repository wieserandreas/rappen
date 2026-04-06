import Decimal from "decimal.js";

/**
 * BVG (Berufliche Vorsorge) parameters for 2026.
 * Source: BSV – Berufliche Vorsorge: Kennzahlen
 * [VERIFY] Confirm 2026 values on bsv.admin.ch when published
 */
export const BVG_2026 = {
	year: 2026,

	/** Entry threshold (Eintrittsschwelle) – annual salary */
	entry_threshold: new Decimal("22050"),

	/** Coordination deduction (Koordinationsabzug) – annual */
	coordination_deduction: new Decimal("25725"),

	/** Maximum insured salary (oberer Grenzbetrag) – annual */
	max_insured_salary: new Decimal("88200"),

	/** Minimum coordinated salary (Mindest-koordinierter Lohn) */
	min_coordinated_salary: new Decimal("3675"),

	/** Age-based contribution rates (Altersgutschriften) – minimum BVG */
	age_credits: [
		{ from_age: 25, to_age: 34, rate: new Decimal("7") },
		{ from_age: 35, to_age: 44, rate: new Decimal("10") },
		{ from_age: 45, to_age: 54, rate: new Decimal("15") },
		{ from_age: 55, to_age: 65, rate: new Decimal("18") },
	],

	/** Minimum employer share of BVG contribution */
	min_employer_share: new Decimal("50"),

	legal_basis: "BVG Art. 7, 8, 16",
} as const;

/**
 * Get BVG age credit rate for a given age.
 */
export function getBvgAgeCredit(age: number): Decimal | null {
	for (const bracket of BVG_2026.age_credits) {
		if (age >= bracket.from_age && age <= bracket.to_age) {
			return bracket.rate;
		}
	}
	return null;
}
