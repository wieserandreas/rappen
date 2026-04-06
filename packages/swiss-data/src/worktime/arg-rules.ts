/**
 * Swiss Labor Law (ArG) working time rules.
 * Source: SECO – Arbeitsgesetz und Verordnungen
 *
 * Art. 9: Maximum working hours
 * Art. 10: Night work
 * Art. 12: Overtime (Überzeit)
 * Art. 13: Überstunden vs Überzeit
 * Art. 15: Break requirements
 * Art. 17-20: Night/Sunday work
 * Art. 31-36: Youth protection
 */

export type IndustryType = "industrial" | "office" | "retail" | "healthcare" | "gastro" | "other";

/** Maximum weekly working hours by industry (Art. 9 ArG) */
export const MAX_WEEKLY_HOURS: Record<IndustryType, number> = {
	industrial: 45,
	office: 45,
	retail: 45,
	healthcare: 50,
	gastro: 50,
	other: 50,
};

/** Maximum daily working hours (no explicit limit in ArG, but derived from rest periods) */
export const MAX_DAILY_HOURS = 14; // 24h - 9h minimum rest - 1h break

/** Maximum overtime (Überzeit) per year (Art. 12 ArG) */
export function getMaxAnnualOvertime(industry: IndustryType): number {
	const weeklyMax = MAX_WEEKLY_HOURS[industry];
	return weeklyMax <= 45 ? 170 : 140;
}

/** Maximum overtime per day (Art. 12 ArG) */
export const MAX_DAILY_OVERTIME = 2;

/** Overtime surcharge rate for hours beyond weekly maximum (Art. 13 ArG) */
export const OVERTIME_SURCHARGE_PERCENT = 25;

/** Minimum rest period between shifts in hours (Art. 15a ArG) */
export const MIN_REST_BETWEEN_SHIFTS = 11;

/** Reduced rest (once per week allowed, Art. 15a Abs. 2 ArG) */
export const MIN_REST_REDUCED = 8;

/**
 * Break requirements based on daily working hours (Art. 15 ArG).
 */
export interface BreakRequirement {
	min_work_hours: number;
	min_break_minutes: number;
	description: string;
}

export const BREAK_REQUIREMENTS: BreakRequirement[] = [
	{ min_work_hours: 5.5, min_break_minutes: 15, description: "Art. 15 Abs. 1 ArG: ≥5.5h → mind. 15min Pause" },
	{ min_work_hours: 7, min_break_minutes: 30, description: "Art. 15 Abs. 1 ArG: ≥7h → mind. 30min Pause" },
	{ min_work_hours: 9, min_break_minutes: 60, description: "Art. 15 Abs. 1 ArG: ≥9h → mind. 60min Pause" },
];

/**
 * Get required break minutes for given work hours.
 */
export function getRequiredBreak(workHours: number): number {
	let required = 0;
	for (const req of BREAK_REQUIREMENTS) {
		if (workHours >= req.min_work_hours) {
			required = req.min_break_minutes;
		}
	}
	return required;
}

/**
 * Night work definition (Art. 17 ArG).
 * Standard: 23:00 - 06:00
 */
export const NIGHT_HOURS = { start: 23, end: 6 };

/** Night work surcharge (Art. 17b ArG): 25% for temporary, 10% time credit for regular */
export const NIGHT_SURCHARGE_PERCENT = 25;

/**
 * Sunday work (Art. 18 ArG): requires cantonal or federal permit.
 * Surcharge: 50% for temporary Sunday work.
 */
export const SUNDAY_SURCHARGE_PERCENT = 50;

/**
 * Youth protection rules (Art. 29-32 ArG / Jugendarbeitsschutzverordnung).
 */
export const YOUTH_RULES = {
	/** Minimum employment age */
	min_age: 15,
	/** Maximum daily hours for workers under 18 */
	max_daily_hours: 9,
	/** Maximum weekly hours for workers under 18 */
	max_weekly_hours: 45,
	/** No night work (20:00-06:00 for under 16, 22:00-06:00 for 16-18) */
	night_start_under_16: 20,
	night_start_16_to_18: 22,
	night_end: 6,
	/** No Sunday work */
	sunday_work_allowed: false,
	legal_basis: "ArG Art. 29-32, ArGV 5",
};
