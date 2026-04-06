import Decimal from "decimal.js";

/**
 * ALV (Arbeitslosenversicherung) rates for 2026.
 * Source: BSV – Beiträge an die Arbeitslosenversicherung
 * [VERIFY] Confirm 2026 rates and salary caps on bsv.admin.ch
 * [VERIFY] Check if solidarity surcharge (Solidaritätsbeitrag) is still in effect for 2026
 */
export const ALV_2026 = {
	year: 2026,

	/** Maximum insured annual salary for regular ALV */
	max_insured_annual: new Decimal("148200"),

	/** Regular ALV employee rate in % (up to max_insured_annual) */
	employee_rate: new Decimal("1.1"),

	/** Regular ALV employer rate in % (up to max_insured_annual) */
	employer_rate: new Decimal("1.1"),

	/** Solidarity surcharge – applies on salary above max_insured_annual up to cap */
	solidarity: {
		/** Employee rate for solidarity surcharge in % */
		employee_rate: new Decimal("0.5"),

		/** Employer rate for solidarity surcharge in % */
		employer_rate: new Decimal("0.5"),

		/** Upper cap for solidarity surcharge (no limit currently) */
		upper_cap: null as Decimal | null,
	},

	legal_basis: "AVIG Art. 3, AVIV Art. 3",
} as const;
