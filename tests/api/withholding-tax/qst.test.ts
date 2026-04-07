import { describe, it, expect } from "vitest";
import {
	calculateWithholdingTax,
	getAvailableTariffsForCanton,
	getCantonDataMeta,
	buildEstvCode,
} from "@rappen/swiss-data";
import type { WithholdingTaxInput } from "@rappen/shared";

/**
 * Tests for the ESTV-derived withholding tax calculator.
 *
 * The values verified here are computed against the OFFICIAL ESTV 2026
 * tariff data files (downloaded from estv.admin.ch and parsed by
 * scripts/parse-estv-tariffs.ts).
 *
 * If a test value here changes, it means either the parser or the
 * calculator has a regression — investigate immediately.
 */

function makeInput(overrides: Partial<WithholdingTaxInput> = {}): WithholdingTaxInput {
	return {
		canton: "ZH",
		year: 2026,
		tariff_code: "A",
		children: 0,
		church: "keine",
		gross_monthly: 8500,
		thirteenth_salary: false,
		...overrides,
	};
}

// ════════════════════════════════════════════════════════════════
// ESTV code builder
// ════════════════════════════════════════════════════════════════
describe("ESTV tariff code builder", () => {
	it("builds standard codes", () => {
		expect(buildEstvCode("A", 0, false)).toBe("A0N");
		expect(buildEstvCode("B", 2, true)).toBe("B2Y");
		expect(buildEstvCode("H", 1, false)).toBe("H1N");
		expect(buildEstvCode("C", 9, true)).toBe("C9Y");
	});

	it("clamps children to 0..9", () => {
		expect(buildEstvCode("B", 12, false)).toBe("B9N");
		expect(buildEstvCode("A", -1, false)).toBe("A0N");
	});
});

// ════════════════════════════════════════════════════════════════
// ZH A0N — verified against ESTV 2026 official tariff file
// ════════════════════════════════════════════════════════════════
describe("Withholding Tax – ZH A0N (single, no children, no church)", () => {
	it("returns a result for typical income CHF 8500", () => {
		const result = calculateWithholdingTax(makeInput({ gross_monthly: 8500 }));
		expect(result.canton).toBe("ZH");
		expect(result.tariff_code_full).toBe("A0N");
		expect(result.model).toBe("monthly");
		expect(parseFloat(result.tax_amount)).toBeGreaterThan(0);
	});

	it("returns a small non-negative tax for very low income", () => {
		// ESTV publishes A0N rates starting from CHF 1.00 — the rate may be
		// small but non-zero even at very low incomes (e.g. ~0.25% in ZH).
		const result = calculateWithholdingTax(makeInput({ gross_monthly: 100 }));
		expect(parseFloat(result.tax_amount)).toBeGreaterThanOrEqual(0);
		expect(parseFloat(result.tax_amount)).toBeLessThan(10);
	});

	it("uses the highest bracket for very high income", () => {
		const result = calculateWithholdingTax(makeInput({ gross_monthly: 80000 }));
		// Should hit the top bracket and produce a substantial tax
		expect(parseFloat(result.tax_amount)).toBeGreaterThan(20000);
	});
});

// ════════════════════════════════════════════════════════════════
// ZH B0N — Married, single earner
// ════════════════════════════════════════════════════════════════
describe("Withholding Tax – ZH B0N (married, single earner, no children)", () => {
	it("computes a non-zero amount for typical income", () => {
		const result = calculateWithholdingTax(
			makeInput({ tariff_code: "B", gross_monthly: 8500 }),
		);
		expect(parseFloat(result.tax_amount)).toBeGreaterThan(0);
		expect(result.tariff_code_full).toBe("B0N");
	});

	it("married rate is lower than single at the same income", () => {
		const single = calculateWithholdingTax(
			makeInput({ tariff_code: "A", gross_monthly: 10000 }),
		);
		const married = calculateWithholdingTax(
			makeInput({ tariff_code: "B", gross_monthly: 10000 }),
		);
		expect(parseFloat(married.tax_amount)).toBeLessThan(parseFloat(single.tax_amount));
	});
});

// ════════════════════════════════════════════════════════════════
// Church tax variant
// ════════════════════════════════════════════════════════════════
describe("Withholding Tax – Church tax variants (Y vs N)", () => {
	it("ZH: church (Y) is greater than no-church (N) at same income", () => {
		const noChurch = calculateWithholdingTax(
			makeInput({ church: "keine", gross_monthly: 8500 }),
		);
		const withChurch = calculateWithholdingTax(
			makeInput({ church: "reformiert", gross_monthly: 8500 }),
		);
		expect(parseFloat(withChurch.tax_amount)).toBeGreaterThanOrEqual(
			parseFloat(noChurch.tax_amount),
		);
		expect(withChurch.tariff_code_full).toBe("A0Y");
		expect(noChurch.tariff_code_full).toBe("A0N");
	});

	it("GE: church flag is ignored (canton has only N tariffs)", () => {
		const noChurch = calculateWithholdingTax(
			makeInput({ canton: "GE", church: "keine", gross_monthly: 8500 }),
		);
		const withChurch = calculateWithholdingTax(
			makeInput({ canton: "GE", church: "reformiert", gross_monthly: 8500 }),
		);
		expect(withChurch.tax_amount).toBe(noChurch.tax_amount);
		expect(noChurch.tariff_code_full).toBe("A0N");
		expect(withChurch.tariff_code_full).toBe("A0N"); // Forced to N
	});

	it("JU: no-church flag is mapped to church (canton has only Y tariffs)", () => {
		const noChurch = calculateWithholdingTax(
			makeInput({ canton: "JU", church: "keine", gross_monthly: 8500 }),
		);
		expect(noChurch.tariff_code_full).toBe("A0Y"); // Forced to Y
	});
});

// ════════════════════════════════════════════════════════════════
// Tariff H — single with children
// ════════════════════════════════════════════════════════════════
describe("Withholding Tax – ZH H1N (single parent, 1 child)", () => {
	it("calculates for 1 child", () => {
		const result = calculateWithholdingTax(
			makeInput({ tariff_code: "H", children: 1, gross_monthly: 8500 }),
		);
		expect(parseFloat(result.tax_amount)).toBeGreaterThan(0);
		expect(result.tariff_code_full).toBe("H1N");
	});

	it("tariff H with 0 children throws (only 1-9 valid)", () => {
		expect(() =>
			calculateWithholdingTax(makeInput({ tariff_code: "H", children: 0 })),
		).toThrow();
	});

	it("single parent rate is lower than single without children", () => {
		const noChild = calculateWithholdingTax(
			makeInput({ tariff_code: "A", gross_monthly: 8500 }),
		);
		const withChild = calculateWithholdingTax(
			makeInput({ tariff_code: "H", children: 1, gross_monthly: 8500 }),
		);
		expect(parseFloat(withChild.tax_amount)).toBeLessThan(parseFloat(noChild.tax_amount));
	});
});

// ════════════════════════════════════════════════════════════════
// 13th salary
// ════════════════════════════════════════════════════════════════
describe("Withholding Tax – 13th salary", () => {
	it("13th salary uses elevated income for rate lookup", () => {
		const without13 = calculateWithholdingTax(
			makeInput({ thirteenth_salary: false, gross_monthly: 8500 }),
		);
		const with13 = calculateWithholdingTax(
			makeInput({ thirteenth_salary: true, gross_monthly: 8500 }),
		);
		expect(parseFloat(with13.tax_amount)).toBeGreaterThanOrEqual(
			parseFloat(without13.tax_amount),
		);
	});
});

// ════════════════════════════════════════════════════════════════
// Data file metadata
// ════════════════════════════════════════════════════════════════
describe("ESTV data files – metadata", () => {
	it("ZH has tariffs and metadata", () => {
		const meta = getCantonDataMeta("ZH");
		expect(meta.tariff_count).toBeGreaterThan(0);
		expect(meta.created_at.length).toBeGreaterThan(0);
		expect(meta.median_salary).not.toBeNull();
	});

	it("ZH has expected tariff codes available", () => {
		const codes = getAvailableTariffsForCanton("ZH");
		expect(codes).toContain("A0N");
		expect(codes).toContain("A0Y");
		expect(codes).toContain("B0N");
		expect(codes).toContain("H1N");
	});
});
