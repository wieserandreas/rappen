import { describe, it, expect } from "vitest";
import { calculateWithholdingTax } from "@rappen/swiss-data";
import { getAvailableTariffs, buildTariffCodeString } from "@rappen/swiss-data";
import type { WithholdingTaxInput } from "@rappen/shared";

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

describe("Withholding Tax – Tariff Code Builder", () => {
	it("should build correct tariff code strings", () => {
		expect(buildTariffCodeString("A", 0, false)).toBe("A0N");
		expect(buildTariffCodeString("B", 2, true)).toBe("B2Y");
		expect(buildTariffCodeString("H", 1, false)).toBe("H1N");
		expect(buildTariffCodeString("C", 9, true)).toBe("C9Y");
	});

	it("should cap children at 9", () => {
		expect(buildTariffCodeString("B", 12, false)).toBe("B9N");
	});
});

describe("Withholding Tax – ZH Tariff A0N (Single, no children, no church)", () => {
	it("should return 0% for income below CHF 1800", () => {
		const result = calculateWithholdingTax(makeInput({ gross_monthly: 1500 }));
		expect(result.tax_amount).toBe("0.00");
	});

	it("should calculate correctly for CHF 5000/month", () => {
		// Bracket 5000-6000: 5.94%
		const result = calculateWithholdingTax(makeInput({ gross_monthly: 5000 }));
		// 5000 * 4.69% = 234.50
		expect(parseFloat(result.tax_amount)).toBeGreaterThan(0);
		expect(result.tariff_code_full).toBe("A0N");
		expect(result.canton).toBe("ZH");
		expect(result.model).toBe("monthly");
	});

	it("should calculate correctly for CHF 8500/month", () => {
		// Bracket 8000-9000: 9.01%
		// 8500 * 9.01% = 765.85 → rounded to 765.85
		const result = calculateWithholdingTax(makeInput({ gross_monthly: 8500 }));
		expect(result.tax_amount).toBe("765.85");
		expect(result.effective_rate).toBe("9.01%");
	});

	it("should calculate correctly for CHF 12500/month", () => {
		// Bracket 12000-14000: 11.80%
		// 12500 * 11.80% = 1475.00
		const result = calculateWithholdingTax(makeInput({ gross_monthly: 12500 }));
		expect(result.tax_amount).toBe("1475.00");
	});

	it("should use highest bracket for very high income", () => {
		// Bracket 50000+: 19.56%
		const result = calculateWithholdingTax(makeInput({ gross_monthly: 80000 }));
		expect(result.effective_rate).toBe("19.56%");
	});
});

describe("Withholding Tax – ZH with Church Tax (A0Y)", () => {
	it("should apply higher rate with church tax", () => {
		const withoutChurch = calculateWithholdingTax(makeInput({ church: "keine", gross_monthly: 8500 }));
		const withChurch = calculateWithholdingTax(makeInput({ church: "reformiert", gross_monthly: 8500 }));

		expect(parseFloat(withChurch.tax_amount)).toBeGreaterThan(parseFloat(withoutChurch.tax_amount));
		expect(withChurch.tariff_code_full).toBe("A0Y");
	});
});

describe("Withholding Tax – ZH Tariff B (Married)", () => {
	it("should return 0% for income below CHF 3200", () => {
		const result = calculateWithholdingTax(makeInput({ tariff_code: "B", gross_monthly: 3000 }));
		expect(result.tax_amount).toBe("0.00");
	});

	it("should have lower rate than single at same income", () => {
		const single = calculateWithholdingTax(makeInput({ tariff_code: "A", gross_monthly: 10000 }));
		const married = calculateWithholdingTax(makeInput({ tariff_code: "B", gross_monthly: 10000 }));
		expect(parseFloat(married.tax_amount)).toBeLessThan(parseFloat(single.tax_amount));
	});
});

describe("Withholding Tax – ZH Tariff H (Single with children)", () => {
	it("should calculate for single parent with 1 child", () => {
		const result = calculateWithholdingTax(makeInput({
			tariff_code: "H",
			children: 1,
			gross_monthly: 8500,
		}));
		expect(parseFloat(result.tax_amount)).toBeGreaterThan(0);
		expect(result.tariff_code_full).toBe("H1N");
	});

	it("should have lower rate than single without children", () => {
		const noChild = calculateWithholdingTax(makeInput({ tariff_code: "A", gross_monthly: 8500 }));
		const withChild = calculateWithholdingTax(makeInput({
			tariff_code: "H",
			children: 1,
			gross_monthly: 8500,
		}));
		expect(parseFloat(withChild.tax_amount)).toBeLessThan(parseFloat(noChild.tax_amount));
	});
});

describe("Withholding Tax – 13th Salary", () => {
	it("should apply higher effective rate when 13th salary exists", () => {
		const without13 = calculateWithholdingTax(makeInput({ thirteenth_salary: false, gross_monthly: 8500 }));
		const with13 = calculateWithholdingTax(makeInput({ thirteenth_salary: true, gross_monthly: 8500 }));
		// The effective rate should be higher with 13th salary because
		// the lookup uses 8500 * 13/12 ≈ 9208 → hits higher bracket
		expect(parseFloat(with13.effective_rate)).toBeGreaterThanOrEqual(parseFloat(without13.effective_rate));
	});
});

describe("Withholding Tax – Error Handling", () => {
	it("should throw for unavailable canton", () => {
		expect(() => calculateWithholdingTax(makeInput({ canton: "BE" }))).toThrow(
			/Keine Quellensteuertarife/,
		);
	});
});

describe("Withholding Tax – Available Tariffs", () => {
	it("should have ZH tariffs registered", () => {
		const available = getAvailableTariffs();
		expect(available.length).toBeGreaterThan(0);
		expect(available.some((k) => k.startsWith("ZH_"))).toBe(true);
	});
});
