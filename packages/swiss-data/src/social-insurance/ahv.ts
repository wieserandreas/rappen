import Decimal from "decimal.js";

/**
 * AHV/IV/EO rates for 2026.
 * Source: BSV – Beiträge an die AHV, die IV und die EO
 * [VERIFY] Confirm 2026 rates on bsv.admin.ch when published
 */
export const AHV_2026 = {
	/** Year these rates apply to */
	year: 2026,

	/** AHV/IV/EO employee rate in % */
	employee_rate: new Decimal("5.3"),

	/** AHV/IV/EO employer rate in % */
	employer_rate: new Decimal("5.3"),

	/** Total AHV/IV/EO rate (AN + AG) */
	total_rate: new Decimal("10.6"),

	/** Monthly exemption for retirees (Freibetrag Rentner) in CHF */
	retiree_monthly_exemption: new Decimal("1400"),

	/** Annual exemption for retirees in CHF */
	retiree_annual_exemption: new Decimal("16800"),

	/** Minimum annual salary for AHV obligation in CHF */
	minimum_annual_salary: new Decimal("2300"),

	legal_basis: "AHVG Art. 5, AHVV Art. 6",
} as const;
