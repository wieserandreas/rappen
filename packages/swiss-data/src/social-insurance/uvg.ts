import Decimal from "decimal.js";

/**
 * UVG (Unfallversicherung) parameters for 2026.
 * Source: Suva / BSV
 * [VERIFY] Confirm 2026 max insured salary
 */
export const UVG_2026 = {
	year: 2026,

	/** Maximum insured annual salary (Höchstversicherter Verdienst) */
	max_insured_annual: new Decimal("148200"),

	/** BU (Berufsunfall) is always paid by employer. Rate varies by industry (0.04% - 15%). */
	bu_paid_by: "employer" as const,

	/** NBU (Nichtberufsunfall) typically paid by employee, but can be employer. */
	nbu_default_paid_by: "employee" as const,

	/** NBU is mandatory for employees working ≥ 8 hours/week */
	nbu_weekly_hours_threshold: 8,

	legal_basis: "UVG Art. 91, 92",
} as const;
