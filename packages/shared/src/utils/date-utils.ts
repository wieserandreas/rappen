import type { CantonCode } from "../types/common.js";

/**
 * Swiss public holidays (federal). Cantons may have additional holidays.
 * Returns holidays for a given year.
 */
export function getSwissPublicHolidays(year: number, canton?: CantonCode): Date[] {
	const holidays: Date[] = [
		new Date(year, 0, 1),   // Neujahr
		new Date(year, 7, 1),   // Bundesfeiertag (1. August)
		new Date(year, 11, 25), // Weihnachten
	];

	// Easter-based holidays (Karfreitag, Ostermontag, Auffahrt, Pfingstmontag)
	const easter = calculateEaster(year);
	holidays.push(
		addDays(easter, -2),  // Karfreitag
		addDays(easter, 1),   // Ostermontag
		addDays(easter, 39),  // Auffahrt (Christi Himmelfahrt)
		addDays(easter, 50),  // Pfingstmontag
	);

	// TODO: Add canton-specific holidays (Berchtoldstag, Fronleichnam, etc.)

	return holidays;
}

/**
 * Calculate Easter Sunday using the Anonymous Gregorian algorithm.
 */
function calculateEaster(year: number): Date {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	return new Date(year, month, day);
}

function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

/**
 * Count working days between two dates (excluding weekends and public holidays).
 */
export function countWorkingDays(from: Date, to: Date, canton?: CantonCode): number {
	const holidays = getSwissPublicHolidays(from.getFullYear(), canton);
	const holidaySet = new Set(holidays.map((d) => d.toISOString().split("T")[0]));
	let count = 0;
	const current = new Date(from);
	while (current <= to) {
		const day = current.getDay();
		const dateStr = current.toISOString().split("T")[0];
		if (day !== 0 && day !== 6 && !holidaySet.has(dateStr)) {
			count++;
		}
		current.setDate(current.getDate() + 1);
	}
	return count;
}
