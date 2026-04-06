import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import { roundTo5Rappen, percentOf } from "@rappen/shared";
import { AHV_2026 } from "@rappen/swiss-data";
import { ALV_2026 } from "@rappen/swiss-data";
import { BVG_2026, getBvgAgeCredit } from "@rappen/swiss-data";

describe("Payroll – Social Insurance Constants", () => {
	it("AHV rates should be 5.3% each side", () => {
		expect(AHV_2026.employee_rate.toString()).toBe("5.3");
		expect(AHV_2026.employer_rate.toString()).toBe("5.3");
		expect(AHV_2026.total_rate.toString()).toBe("10.6");
	});

	it("ALV max insured annual should be 148200", () => {
		expect(ALV_2026.max_insured_annual.toString()).toBe("148200");
		expect(ALV_2026.employee_rate.toString()).toBe("1.1");
	});

	it("BVG entry threshold should be 22050", () => {
		expect(BVG_2026.entry_threshold.toString()).toBe("22050");
		expect(BVG_2026.coordination_deduction.toString()).toBe("25725");
		expect(BVG_2026.max_insured_salary.toString()).toBe("88200");
	});

	it("BVG age credits should return correct rates", () => {
		expect(getBvgAgeCredit(30)?.toString()).toBe("7");
		expect(getBvgAgeCredit(40)?.toString()).toBe("10");
		expect(getBvgAgeCredit(50)?.toString()).toBe("15");
		expect(getBvgAgeCredit(60)?.toString()).toBe("18");
		expect(getBvgAgeCredit(24)).toBeNull();
	});
});

describe("Payroll – Swiss Rounding", () => {
	it("should round to nearest 5 Rappen", () => {
		expect(roundTo5Rappen(1.01).toString()).toBe("1");
		expect(roundTo5Rappen(1.02).toString()).toBe("1");
		expect(roundTo5Rappen(1.03).toString()).toBe("1.05");
		expect(roundTo5Rappen(1.06).toString()).toBe("1.05");
		expect(roundTo5Rappen(1.08).toString()).toBe("1.1");
		expect(roundTo5Rappen(1.12).toString()).toBe("1.1");
		expect(roundTo5Rappen(1.13).toString()).toBe("1.15");
		expect(roundTo5Rappen(99.99).toString()).toBe("100");
	});

	it("should calculate percentages precisely", () => {
		const gross = new Decimal("8500");
		const ahvDeduction = percentOf(gross, AHV_2026.employee_rate);
		expect(ahvDeduction.toString()).toBe("450.5");
	});
});
