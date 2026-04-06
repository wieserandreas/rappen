import { describe, it, expect } from "vitest";
import { validateWorktime, getRequiredBreak, MAX_WEEKLY_HOURS, getMaxAnnualOvertime } from "@rappen/swiss-data";
import type { WorktimeValidationInput, WorktimeEntry } from "@rappen/shared";

function makeInput(entries: WorktimeEntry[], overrides: Partial<WorktimeValidationInput["employee"]> = {}): WorktimeValidationInput {
	return {
		entries,
		employee: {
			age: 30,
			industry: "office",
			has_night_permit: false,
			has_sunday_permit: false,
			...overrides,
		},
		year: 2026,
	};
}

function makeEntry(date: string, start: string, end: string, breakMin: number, type: WorktimeEntry["type"] = "regular"): WorktimeEntry {
	return { date, start, end, break_minutes: breakMin, type };
}

describe("Worktime – ArG Rules Constants", () => {
	it("office/industrial max weekly hours should be 45", () => {
		expect(MAX_WEEKLY_HOURS.office).toBe(45);
		expect(MAX_WEEKLY_HOURS.industrial).toBe(45);
	});

	it("gastro/healthcare max weekly hours should be 50", () => {
		expect(MAX_WEEKLY_HOURS.gastro).toBe(50);
		expect(MAX_WEEKLY_HOURS.healthcare).toBe(50);
	});

	it("max annual overtime should be 170h for 45h-week, 140h for 50h-week", () => {
		expect(getMaxAnnualOvertime("office")).toBe(170);
		expect(getMaxAnnualOvertime("gastro")).toBe(140);
	});

	it("break requirements should be correct", () => {
		expect(getRequiredBreak(4)).toBe(0);
		expect(getRequiredBreak(5.5)).toBe(15);
		expect(getRequiredBreak(7)).toBe(30);
		expect(getRequiredBreak(9)).toBe(60);
	});
});

describe("Worktime – Compliant Schedule", () => {
	it("should validate a normal 8h day as compliant", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-02", "08:00", "17:00", 60), // Mon: 8h net
			makeEntry("2026-03-03", "08:00", "17:00", 60), // Tue
			makeEntry("2026-03-04", "08:00", "17:00", 60), // Wed
			makeEntry("2026-03-05", "08:00", "17:00", 60), // Thu
			makeEntry("2026-03-06", "08:00", "17:00", 60), // Fri
		]));
		expect(result.compliant).toBe(true);
		expect(result.violations.filter(v => v.severity === "error")).toHaveLength(0);
		expect(result.summary.total_hours).toBe("40.0");
	});
});

describe("Worktime – Break Violations", () => {
	it("should detect insufficient break for 9h work", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-02", "07:00", "17:00", 30), // 10h work, only 30min break (need 60)
		]));
		expect(result.compliant).toBe(false);
		expect(result.violations.some(v => v.article === "Art. 15 ArG")).toBe(true);
	});

	it("should accept sufficient break", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-02", "07:00", "17:00", 60), // 10h work, 60min break OK
		]));
		const breakViolations = result.violations.filter(v => v.article === "Art. 15 ArG");
		expect(breakViolations).toHaveLength(0);
	});
});

describe("Worktime – Night Work", () => {
	it("should detect night work without permit", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-02", "22:00", "06:00", 30),
		]));
		expect(result.violations.some(v => v.article === "Art. 17 ArG")).toBe(true);
	});

	it("should allow night work with permit", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-02", "22:00", "06:00", 30),
		], { has_night_permit: true }));
		expect(result.violations.filter(v => v.article === "Art. 17 ArG")).toHaveLength(0);
	});
});

describe("Worktime – Sunday Work", () => {
	it("should detect Sunday work without permit", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-01", "08:00", "16:00", 30), // Sunday
		]));
		expect(result.violations.some(v => v.article === "Art. 18 ArG")).toBe(true);
	});

	it("should allow Sunday work with permit", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-01", "08:00", "16:00", 30),
		], { has_sunday_permit: true }));
		expect(result.violations.filter(v => v.article === "Art. 18 ArG")).toHaveLength(0);
	});
});

describe("Worktime – Youth Protection", () => {
	it("should detect overtime for workers under 18", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-02", "07:00", "18:00", 60), // 10h work, youth max 9h
		], { age: 17 }));
		expect(result.violations.some(v => v.article === "ArG Art. 31")).toBe(true);
	});

	it("should detect night work for youth", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-02", "20:00", "02:00", 30),
		], { age: 17 }));
		expect(result.violations.some(v => v.article.includes("Art. 31"))).toBe(true);
	});
});

describe("Worktime – Rest Between Shifts", () => {
	it("should detect insufficient rest between shifts", () => {
		const result = validateWorktime(makeInput([
			makeEntry("2026-03-02", "08:00", "22:00", 60), // Mon until 22:00
			makeEntry("2026-03-03", "06:00", "14:00", 30), // Tue from 06:00 → only 8h rest
		]));
		expect(result.violations.some(v => v.article === "Art. 15a ArG")).toBe(true);
	});
});
