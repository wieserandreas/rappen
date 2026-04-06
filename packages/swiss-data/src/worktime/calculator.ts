import type { WorktimeValidationInput, WorktimeValidationResult, WorktimeViolation, WorktimeEntry } from "@rappen/shared";
import {
	MAX_WEEKLY_HOURS,
	MAX_DAILY_HOURS,
	MAX_DAILY_OVERTIME,
	getMaxAnnualOvertime,
	getRequiredBreak,
	NIGHT_HOURS,
	MIN_REST_BETWEEN_SHIFTS,
	YOUTH_RULES,
} from "./arg-rules.js";

/**
 * Validate working time entries against Swiss labor law (ArG).
 * Returns compliance status, violations, and summary statistics.
 */
export function validateWorktime(input: WorktimeValidationInput): WorktimeValidationResult {
	const violations: WorktimeViolation[] = [];
	const { entries, employee } = input;
	const weeklyMax = MAX_WEEKLY_HOURS[employee.industry];
	const annualOvertimeMax = getMaxAnnualOvertime(employee.industry);

	let totalHours = 0;
	let overtimeHours = 0;
	let nightHours = 0;
	let sundayHours = 0;

	// Sort entries by date
	const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

	// ── Per-day checks ──
	for (let i = 0; i < sorted.length; i++) {
		const entry = sorted[i];
		const workHours = calculateWorkHours(entry);
		const netHours = workHours - entry.break_minutes / 60;

		totalHours += netHours;

		// Daily maximum
		if (netHours > MAX_DAILY_HOURS) {
			violations.push({
				date: entry.date,
				rule: "Tägliche Höchstarbeitszeit überschritten",
				article: "Art. 9/10 ArG",
				severity: "error",
				message: `${netHours.toFixed(1)}h gearbeitet, Maximum ist ${MAX_DAILY_HOURS}h pro Tag.`,
			});
		}

		// Break requirements
		const requiredBreak = getRequiredBreak(workHours);
		if (entry.break_minutes < requiredBreak) {
			violations.push({
				date: entry.date,
				rule: "Ungenügende Pausenzeit",
				article: "Art. 15 ArG",
				severity: "error",
				message: `${entry.break_minutes}min Pause bei ${workHours.toFixed(1)}h Arbeit. Minimum: ${requiredBreak}min.`,
			});
		}

		// Night work check
		const nightMins = calculateNightMinutes(entry);
		if (nightMins > 0) {
			nightHours += nightMins / 60;
			if (!employee.has_night_permit) {
				violations.push({
					date: entry.date,
					rule: "Nachtarbeit ohne Bewilligung",
					article: "Art. 17 ArG",
					severity: "error",
					message: `${Math.round(nightMins)}min Nachtarbeit (23:00-06:00) ohne Bewilligung.`,
				});
			}
		}

		// Sunday work check
		const dayOfWeek = new Date(entry.date).getDay();
		if (dayOfWeek === 0) {
			sundayHours += netHours;
			if (!employee.has_sunday_permit) {
				violations.push({
					date: entry.date,
					rule: "Sonntagsarbeit ohne Bewilligung",
					article: "Art. 18 ArG",
					severity: "error",
					message: "Sonntagsarbeit erfordert eine Bewilligung.",
				});
			}
		}

		// Rest between shifts
		if (i > 0) {
			const prevEntry = sorted[i - 1];
			const restHours = calculateRestBetweenShifts(prevEntry, entry);
			if (restHours !== null && restHours < MIN_REST_BETWEEN_SHIFTS) {
				violations.push({
					date: entry.date,
					rule: "Ungenügende Ruhezeit zwischen Schichten",
					article: "Art. 15a ArG",
					severity: restHours >= 8 ? "warning" : "error",
					message: `${restHours.toFixed(1)}h Ruhezeit zwischen Schichten. Minimum: ${MIN_REST_BETWEEN_SHIFTS}h (ausnahmsweise 8h).`,
				});
			}
		}

		// Youth protection
		if (employee.age < 18) {
			if (netHours > YOUTH_RULES.max_daily_hours) {
				violations.push({
					date: entry.date,
					rule: "Tägliche Höchstarbeitszeit für Jugendliche überschritten",
					article: "ArG Art. 31",
					severity: "error",
					message: `${netHours.toFixed(1)}h gearbeitet. Jugendliche (<18): max. ${YOUTH_RULES.max_daily_hours}h/Tag.`,
				});
			}
			if (nightMins > 0) {
				violations.push({
					date: entry.date,
					rule: "Nachtarbeit für Jugendliche verboten",
					article: "ArG Art. 31 Abs. 4",
					severity: "error",
					message: "Nachtarbeit ist für Arbeitnehmende unter 18 Jahren verboten.",
				});
			}
			if (dayOfWeek === 0) {
				violations.push({
					date: entry.date,
					rule: "Sonntagsarbeit für Jugendliche verboten",
					article: "ArG Art. 31 Abs. 4",
					severity: "error",
					message: "Sonntagsarbeit ist für Arbeitnehmende unter 18 Jahren verboten.",
				});
			}
		}
	}

	// ── Weekly checks ──
	const weeklyGroups = groupByWeek(sorted);
	let maxWeeklyExceeded = false;

	for (const [week, weekEntries] of weeklyGroups) {
		const weeklyTotal = weekEntries.reduce((sum, e) => {
			return sum + calculateWorkHours(e) - e.break_minutes / 60;
		}, 0);

		if (weeklyTotal > weeklyMax) {
			maxWeeklyExceeded = true;
			const overtime = weeklyTotal - weeklyMax;
			overtimeHours += overtime;

			if (overtime > MAX_DAILY_OVERTIME * 5) {
				violations.push({
					date: weekEntries[0].date,
					rule: "Wöchentliche Höchstarbeitszeit überschritten",
					article: "Art. 9 ArG",
					severity: "error",
					message: `KW ${week}: ${weeklyTotal.toFixed(1)}h gearbeitet, Maximum ${weeklyMax}h. Überzeit: ${overtime.toFixed(1)}h.`,
				});
			}
		}
	}

	const annualOvertimeRemaining = Math.max(0, annualOvertimeMax - overtimeHours);

	return {
		compliant: violations.filter((v) => v.severity === "error").length === 0,
		violations,
		summary: {
			total_hours: totalHours.toFixed(1),
			overtime_hours: overtimeHours.toFixed(1),
			night_hours: nightHours.toFixed(1),
			sunday_hours: sundayHours.toFixed(1),
			max_weekly_hours_exceeded: maxWeeklyExceeded,
			annual_overtime_remaining: annualOvertimeRemaining.toFixed(1),
		},
		legal_basis: [
			"ArG Art. 9 (Höchstarbeitszeit)",
			"ArG Art. 12 (Überzeit)",
			"ArG Art. 15 (Pausen)",
			"ArG Art. 15a (Ruhezeit)",
			"ArG Art. 17-20 (Nacht-/Sonntagsarbeit)",
		],
	};
}

// ════════════════════════════════════════════════════════════
// Helper functions
// ════════════════════════════════════════════════════════════

function calculateWorkHours(entry: WorktimeEntry): number {
	const [startH, startM] = entry.start.split(":").map(Number);
	const [endH, endM] = entry.end.split(":").map(Number);
	let startMinutes = startH * 60 + startM;
	let endMinutes = endH * 60 + endM;
	// Handle overnight shifts
	if (endMinutes <= startMinutes) {
		endMinutes += 24 * 60;
	}
	return (endMinutes - startMinutes) / 60;
}

function calculateNightMinutes(entry: WorktimeEntry): number {
	const [startH, startM] = entry.start.split(":").map(Number);
	const [endH, endM] = entry.end.split(":").map(Number);
	let startMin = startH * 60 + startM;
	let endMin = endH * 60 + endM;
	if (endMin <= startMin) endMin += 24 * 60;

	const nightStartMin = NIGHT_HOURS.start * 60; // 23:00 = 1380
	const nightEndMin = NIGHT_HOURS.end * 60; // 06:00 = 360
	const nightEndNextDay = nightEndMin + 24 * 60; // 30:00 = 1800

	let nightMinutes = 0;

	// Night period 1: 23:00 (1380) to 30:00 (next day 06:00 = 1800)
	const overlapStart = Math.max(startMin, nightStartMin);
	const overlapEnd = Math.min(endMin, nightEndNextDay);
	if (overlapEnd > overlapStart) {
		nightMinutes += overlapEnd - overlapStart;
	}

	// Night period 2: 00:00 (0) to 06:00 (360) same day
	if (startMin < nightEndMin) {
		const earlyOverlap = Math.min(endMin, nightEndMin) - startMin;
		if (earlyOverlap > 0) {
			nightMinutes += earlyOverlap;
		}
	}

	return nightMinutes;
}

function calculateRestBetweenShifts(prev: WorktimeEntry, current: WorktimeEntry): number | null {
	if (prev.date === current.date) return null; // Same day, can't calculate

	const prevEndParts = prev.end.split(":").map(Number);
	const currStartParts = current.start.split(":").map(Number);

	const prevDate = new Date(prev.date);
	const currDate = new Date(current.date);

	const prevEndMs = prevDate.getTime() + (prevEndParts[0] * 60 + prevEndParts[1]) * 60000;
	const currStartMs = currDate.getTime() + (currStartParts[0] * 60 + currStartParts[1]) * 60000;

	return (currStartMs - prevEndMs) / 3600000;
}

function groupByWeek(entries: WorktimeEntry[]): Map<number, WorktimeEntry[]> {
	const groups = new Map<number, WorktimeEntry[]>();
	for (const entry of entries) {
		const date = new Date(entry.date);
		const week = getIsoWeek(date);
		if (!groups.has(week)) groups.set(week, []);
		groups.get(week)!.push(entry);
	}
	return groups;
}

function getIsoWeek(date: Date): number {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
