import { describe, it, expect, beforeEach } from "vitest";
import {
	listAvailableQstYears,
	getCurrentQstYear,
	getLatestQstYear,
	getCantonDataMeta,
	calculateWithholdingTax,
	_resetQstCache,
} from "@rappen/swiss-data";

/**
 * Year discovery and multi-year tariff tests.
 *
 * The QST loader must:
 *   1. Auto-discover all available qst-{YEAR} directories
 *   2. Pick the most recent year ≤ today as the "current" year
 *   3. Allow explicit year selection via input.year
 *   4. Fall back gracefully if a requested year is missing
 */

beforeEach(() => {
	_resetQstCache();
});

describe("QST – Year discovery", () => {
	it("returns at least one year", () => {
		const years = listAvailableQstYears();
		expect(years.length).toBeGreaterThan(0);
	});

	it("years are sorted ascending", () => {
		const years = listAvailableQstYears();
		const sorted = [...years].sort((a, b) => a - b);
		expect(years).toEqual(sorted);
	});

	it("contains 2026 (the initial production year)", () => {
		const years = listAvailableQstYears();
		expect(years).toContain(2026);
	});

	it("getLatestQstYear returns the highest available year", () => {
		const years = listAvailableQstYears();
		const latest = getLatestQstYear();
		expect(latest).toBe(years[years.length - 1]);
	});

	it("getCurrentQstYear returns a year ≤ today's year", () => {
		const current = getCurrentQstYear();
		const today = new Date().getFullYear();
		expect(current).toBeLessThanOrEqual(today);
	});
});

describe("QST – Multi-year metadata", () => {
	it("getCantonDataMeta includes the year field", () => {
		const meta = getCantonDataMeta("ZH");
		expect(meta.year).toBeGreaterThan(0);
		expect(meta.tariff_count).toBeGreaterThan(0);
	});

	it("explicit year parameter is honoured", () => {
		const meta2026 = getCantonDataMeta("ZH", 2026);
		expect(meta2026.year).toBe(2026);
		expect(meta2026.source).toContain("2026");
	});
});

describe("QST – Year fallback in calculator", () => {
	it("future year falls back to latest available", () => {
		// Request 2099 — falls back to whatever the latest available year is
		const result = calculateWithholdingTax({
			canton: "ZH",
			year: 2099,
			tariff_code: "A",
			children: 0,
			church: "keine",
			gross_monthly: 8500,
			thirteenth_salary: false,
		});
		// The result year should be the actual fallback year, not 2099
		expect(result.year).toBeLessThanOrEqual(2099);
		expect(result.year).toBeGreaterThanOrEqual(2026);
		expect(parseFloat(result.tax_amount)).toBeGreaterThan(0);
	});

	it("current year (2026) calculates without fallback", () => {
		const result = calculateWithholdingTax({
			canton: "ZH",
			year: 2026,
			tariff_code: "A",
			children: 0,
			church: "keine",
			gross_monthly: 8500,
			thirteenth_salary: false,
		});
		expect(result.year).toBe(2026);
	});

	it("ancient year (1900) throws because nothing earlier exists", () => {
		expect(() =>
			calculateWithholdingTax({
				canton: "ZH",
				year: 1900,
				tariff_code: "A",
				children: 0,
				church: "keine",
				gross_monthly: 8500,
				thirteenth_salary: false,
			}),
		).toThrow(/Keine Quellensteuertarife verfügbar/);
	});
});
