import { describe, it, expect } from "vitest";
import { calculateCrossBorder, DBA_RULES, TELEWORK_RULES } from "@rappen/swiss-data";
import type { CrossBorderInput } from "@rappen/shared";

function makeInput(overrides: Partial<CrossBorderInput> = {}): CrossBorderInput {
	return {
		residence_country: "DE",
		work_canton: "ZH",
		gross_annual: 100000,
		telework_days_per_year: 20,
		total_work_days_per_year: 220,
		marital_status: "single",
		children: 0,
		nationality: "DE",
		has_g_permit: true,
		...overrides,
	};
}

describe("Cross-Border – DBA Treaties", () => {
	it("should have rules for all 5 neighbor countries", () => {
		expect(Object.keys(DBA_RULES)).toHaveLength(5);
		expect(DBA_RULES.DE).toBeDefined();
		expect(DBA_RULES.FR).toBeDefined();
		expect(DBA_RULES.IT).toBeDefined();
		expect(DBA_RULES.AT).toBeDefined();
		expect(DBA_RULES.LI).toBeDefined();
	});

	it("should have telework rules for all 5 countries", () => {
		expect(Object.keys(TELEWORK_RULES)).toHaveLength(5);
	});
});

describe("Cross-Border – DE Grenzgänger", () => {
	it("should calculate basic DE cross-border scenario", () => {
		const result = calculateCrossBorder(makeInput());
		expect(result.social_security_country).toBe("CH");
		expect(result.telework_threshold_exceeded).toBe(false);
		expect(result.a1_certificate_required).toBe(true);
		expect(result.telework_percentage).toBe("9.1%");
	});

	it("should flag excessive telework", () => {
		const result = calculateCrossBorder(makeInput({ telework_days_per_year: 120 }));
		expect(result.telework_threshold_exceeded).toBe(true);
		expect(result.social_security_country).toBe("DE");
		expect(result.warnings.length).toBeGreaterThan(0);
	});
});

describe("Cross-Border – FR Grenzgänger", () => {
	it("should detect FR Abkommenskanton (VD)", () => {
		const result = calculateCrossBorder(makeInput({
			residence_country: "FR",
			work_canton: "VD",
		}));
		expect(result.withholding_tax_applicable).toBe(false);
		expect(result.warnings.some(w => w.includes("Grenzgängerabkommen"))).toBe(true);
	});

	it("should apply QST in non-Abkommenskanton (GE)", () => {
		const result = calculateCrossBorder(makeInput({
			residence_country: "FR",
			work_canton: "GE",
		}));
		expect(result.withholding_tax_applicable).toBe(true);
	});
});

describe("Cross-Border – IT Grenzgänger", () => {
	it("should reference new DBA CH-IT", () => {
		const result = calculateCrossBorder(makeInput({
			residence_country: "IT",
			work_canton: "TI",
		}));
		expect(result.dba_article).toContain("Grenzgängerabkommen CH-IT");
	});
});

describe("Cross-Border – LEADS Reporting", () => {
	it("should require LEADS when telework and A1 apply", () => {
		const result = calculateCrossBorder(makeInput({ telework_days_per_year: 30 }));
		expect(result.leads_reporting_required).toBe(true);
	});

	it("should not require LEADS with zero telework and G permit", () => {
		const result = calculateCrossBorder(makeInput({ telework_days_per_year: 0 }));
		expect(result.leads_reporting_required).toBe(false);
	});
});
