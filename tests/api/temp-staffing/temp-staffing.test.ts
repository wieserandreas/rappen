import { describe, it, expect } from "vitest";
import { validateTempStaffing } from "@rappen/swiss-data";
import type { TempStaffingInput } from "@rappen/shared";

function makeInput(overrides: Partial<TempStaffingInput> = {}): TempStaffingInput {
	return {
		assignment: {
			start_date: "2026-03-01",
			end_date: "2026-09-01",
			canton: "ZH",
			industry: "IT",
			...overrides.assignment,
		},
		worker: {
			nationality: "CH",
			permit_type: "CH",
			hourly_rate: 55,
			employment_percentage: 100,
			...overrides.worker,
		},
		agency: {
			has_seco_license: true,
			license_type: "ch_only",
			has_caution: true,
			caution_amount: 50000,
			...overrides.agency,
		},
		...overrides,
	} as TempStaffingInput;
}

describe("Temp Staffing – License Check", () => {
	it("should validate compliant setup", () => {
		const result = validateTempStaffing(makeInput());
		expect(result.compliant).toBe(true);
		expect(result.violations.filter(v => v.severity === "error")).toHaveLength(0);
	});

	it("should flag missing SECO license", () => {
		const result = validateTempStaffing(makeInput({
			agency: { has_seco_license: false, has_caution: true, caution_amount: 50000 } as any,
		}));
		expect(result.compliant).toBe(false);
		expect(result.violations.some(v => v.article === "AVG Art. 12")).toBe(true);
	});
});

describe("Temp Staffing – Caution", () => {
	it("should require CHF 50'000 for CH-only license", () => {
		const result = validateTempStaffing(makeInput());
		expect(result.required_caution).toBe("CHF 50000");
	});

	it("should require CHF 100'000 for CH+abroad license", () => {
		const result = validateTempStaffing(makeInput({
			agency: { has_seco_license: true, license_type: "ch_and_abroad", has_caution: true, caution_amount: 100000 } as any,
		}));
		expect(result.required_caution).toBe("CHF 100000");
	});

	it("should flag missing caution", () => {
		const result = validateTempStaffing(makeInput({
			agency: { has_seco_license: true, license_type: "ch_only", has_caution: false } as any,
		}));
		expect(result.violations.some(v => v.article === "AVV Art. 35")).toBe(true);
	});

	it("should flag insufficient caution amount", () => {
		const result = validateTempStaffing(makeInput({
			agency: { has_seco_license: true, license_type: "ch_only", has_caution: true, caution_amount: 30000 } as any,
		}));
		expect(result.violations.some(v => v.message.includes("ungenügend"))).toBe(true);
	});
});

describe("Temp Staffing – Assignment Duration", () => {
	it("should warn about long assignments (>12 months)", () => {
		const result = validateTempStaffing(makeInput({
			assignment: { start_date: "2026-01-01", end_date: "2027-06-01", canton: "ZH", industry: "IT" },
		}));
		expect(result.violations.some(v => v.article.includes("AVG Art. 22"))).toBe(true);
	});
});

describe("Temp Staffing – Worker Permits", () => {
	it("should warn about restricted permits (L)", () => {
		const result = validateTempStaffing(makeInput({
			worker: { nationality: "XX", permit_type: "L", hourly_rate: 55, employment_percentage: 100 },
		}));
		expect(result.violations.some(v => v.message.includes("Bewilligungstyp L"))).toBe(true);
	});

	it("should warn about G-permit without abroad license", () => {
		const result = validateTempStaffing(makeInput({
			worker: { nationality: "DE", permit_type: "G", hourly_rate: 55, employment_percentage: 100 },
		}));
		expect(result.violations.some(v => v.article.includes("AVG Art. 12 Abs. 2"))).toBe(true);
	});
});
