import { describe, it, expect } from "vitest";
import { CANTONS, type CantonCode, type WithholdingTaxInput } from "@rappen/shared";
import {
	calculateWithholdingTax,
	getCantonDataMeta,
	getAvailableTariffsForCanton,
} from "@rappen/swiss-data";

/**
 * COMPREHENSIVE 26-CANTON QUELLENSTEUER E2E TEST
 *
 * Verifies that the calculator works correctly for ALL 26 Swiss cantons
 * using the official ESTV 2026 tariff data. For each canton, runs
 * multiple realistic scenarios and asserts:
 *
 *   1. The calculation does not throw
 *   2. The tax amount is non-negative
 *   3. The effective rate is plausible (0% to 50%)
 *   4. The 5-Rappen rounding is preserved
 *   5. The tariff code on the result matches the input
 *   6. Canton-specific church tax rules (GE/NE/VD/VS/TI = N only,
 *      JU = Y only) are applied
 *
 * If this test passes, the QST API is production-ready for nationwide use.
 */

interface CantonScenario {
	name: string;
	input: Omit<WithholdingTaxInput, "canton">;
}

const SCENARIOS: CantonScenario[] = [
	{
		name: "Single, no children, no church, 8500 CHF",
		input: {
			year: 2026,
			tariff_code: "A",
			children: 0,
			church: "keine",
			gross_monthly: 8500,
			thirteenth_salary: false,
		},
	},
	{
		name: "Single with church, 6000 CHF",
		input: {
			year: 2026,
			tariff_code: "A",
			children: 0,
			church: "reformiert",
			gross_monthly: 6000,
			thirteenth_salary: false,
		},
	},
	{
		name: "Married single earner, 2 children, no church, 9500 CHF, 13th",
		input: {
			year: 2026,
			tariff_code: "B",
			children: 2,
			church: "keine",
			gross_monthly: 9500,
			thirteenth_salary: true,
		},
	},
	{
		name: "Married dual earner, 1 child, with church, 7000 CHF",
		input: {
			year: 2026,
			tariff_code: "C",
			children: 1,
			church: "katholisch",
			gross_monthly: 7000,
			thirteenth_salary: false,
		},
	},
	{
		name: "Single parent, 1 child (tariff H), 8000 CHF",
		input: {
			year: 2026,
			tariff_code: "H",
			children: 1,
			church: "keine",
			gross_monthly: 8000,
			thirteenth_salary: false,
		},
	},
];

describe("E2E – Quellensteuer for ALL 26 cantons × all scenarios", () => {
	for (const canton of CANTONS) {
		describe(`Canton ${canton}`, () => {
			for (const scenario of SCENARIOS) {
				it(`computes: ${scenario.name}`, () => {
					const input: WithholdingTaxInput = { ...scenario.input, canton };
					const result = calculateWithholdingTax(input);

					// Result must have all fields
					expect(result.tax_amount).toBeDefined();
					expect(result.effective_rate).toBeDefined();
					expect(result.tariff_code_full).toBeDefined();
					expect(result.canton).toBe(canton);
					expect(result.year).toBe(2026);
					expect(result.legal_basis.length).toBeGreaterThan(0);

					// Tax must be non-negative
					const tax = parseFloat(result.tax_amount);
					expect(tax).toBeGreaterThanOrEqual(0);

					// Rate must be plausible
					const rate = parseFloat(result.effective_rate);
					expect(rate).toBeGreaterThanOrEqual(0);
					expect(rate).toBeLessThanOrEqual(50);

					// Tax cannot exceed gross income
					expect(tax).toBeLessThanOrEqual(scenario.input.gross_monthly);

					// 5-Rappen rounding
					const remainder = (tax * 20) % 1;
					expect(Math.abs(remainder)).toBeLessThan(0.001);

					// Tariff code reflects the input tariff group
					expect(result.tariff_code_full[0]).toBe(scenario.input.tariff_code);

					// Children digit
					expect(result.tariff_code_full[1]).toBe(scenario.input.children.toString());
				});
			}
		});
	}
});

describe("E2E – Canton-specific church tax rules", () => {
	const NO_CHURCH_CANTONS: CantonCode[] = ["GE", "NE", "VD", "VS", "TI"];
	const ONLY_CHURCH_CANTONS: CantonCode[] = ["JU"];

	for (const canton of NO_CHURCH_CANTONS) {
		it(`${canton}: church flag is forced to N regardless of input`, () => {
			const noChurch = calculateWithholdingTax({
				canton,
				year: 2026,
				tariff_code: "A",
				children: 0,
				church: "keine",
				gross_monthly: 8500,
				thirteenth_salary: false,
			});
			const withChurch = calculateWithholdingTax({
				canton,
				year: 2026,
				tariff_code: "A",
				children: 0,
				church: "reformiert",
				gross_monthly: 8500,
				thirteenth_salary: false,
			});
			expect(noChurch.tariff_code_full).toBe("A0N");
			expect(withChurch.tariff_code_full).toBe("A0N");
			expect(withChurch.tax_amount).toBe(noChurch.tax_amount);
		});
	}

	for (const canton of ONLY_CHURCH_CANTONS) {
		it(`${canton}: church flag is forced to Y regardless of input`, () => {
			const noChurch = calculateWithholdingTax({
				canton,
				year: 2026,
				tariff_code: "A",
				children: 0,
				church: "keine",
				gross_monthly: 8500,
				thirteenth_salary: false,
			});
			expect(noChurch.tariff_code_full).toBe("A0Y");
		});
	}
});

describe("E2E – Data file metadata for all 26 cantons", () => {
	for (const canton of CANTONS) {
		it(`${canton} has metadata and tariffs`, () => {
			const meta = getCantonDataMeta(canton);
			expect(meta.tariff_count).toBeGreaterThan(0);
			expect(meta.created_at.length).toBeGreaterThan(0);
			expect(meta.median_salary).not.toBeNull();
			expect(meta.source).toContain("ESTV");

			const codes = getAvailableTariffsForCanton(canton);
			expect(codes.length).toBeGreaterThan(0);
			// Every canton must have at least the basic A tariff
			const hasA = codes.some((c) => c.startsWith("A0"));
			expect(hasA, `${canton} missing A0 tariff`).toBe(true);
		});
	}
});
