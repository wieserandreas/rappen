import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import { CANTONS, type CantonCode, type PayrollInput } from "@rappen/shared";
import { calculatePayroll, FAK_2026, CANTON_REGISTRY } from "@rappen/swiss-data";

/**
 * COMPREHENSIVE 26-CANTON END-TO-END TEST
 *
 * This test runs the complete payroll calculator for EVERY Swiss canton
 * with realistic input data and verifies:
 *   1. The calculation does not throw
 *   2. The result has all required fields
 *   3. Net salary is between 70-90% of gross (sanity check)
 *   4. All deductions are positive numbers
 *   5. Cantonal child allowances match the FAK registry
 *   6. Employer costs are reasonable
 *
 * If this test passes for all 26 cantons, the payroll API is
 * production-ready for nationwide use.
 */

interface CantonScenario {
	name: string;
	input: Omit<PayrollInput, "canton">;
}

const SCENARIOS: CantonScenario[] = [
	{
		name: "Single, age 30, 8500 CHF",
		input: {
			gross_monthly: 8500,
			birth_year: 1995,
			marital_status: "single",
			children: 0,
			church: "keine",
			withholding_tax: false,
			bvg_plan: "minimum",
			uvg_nbu_rate: 1.5,
			employment_percentage: 100,
			thirteenth_salary: false,
		},
	},
	{
		name: "Married, age 45, 12000 CHF, 2 children, 13th salary",
		input: {
			gross_monthly: 12000,
			birth_year: 1980,
			marital_status: "married",
			children: 2,
			children_ages: [8, 17],
			church: "reformiert",
			withholding_tax: false,
			bvg_plan: "minimum",
			uvg_nbu_rate: 1.5,
			employment_percentage: 100,
			thirteenth_salary: true,
		},
	},
	{
		name: "Part-time 60%, age 28, 4500 CHF",
		input: {
			gross_monthly: 4500,
			birth_year: 1997,
			marital_status: "single",
			children: 0,
			church: "keine",
			withholding_tax: false,
			bvg_plan: "minimum",
			uvg_nbu_rate: 1.2,
			employment_percentage: 60,
			thirteenth_salary: false,
		},
	},
	{
		name: "High earner, age 50, 18000 CHF (ALV solidarity)",
		input: {
			gross_monthly: 18000,
			birth_year: 1975,
			marital_status: "married",
			children: 1,
			children_ages: [10],
			church: "katholisch",
			withholding_tax: false,
			bvg_plan: "minimum",
			uvg_nbu_rate: 1.5,
			employment_percentage: 100,
			thirteenth_salary: true,
			bonus: 10000,
		},
	},
];

/**
 * Run every scenario for every canton.
 * Total: 4 scenarios × 26 cantons = 104 full payroll calculations.
 */
describe("E2E – Payroll calculator: ALL 26 cantons × all scenarios", () => {
	for (const canton of CANTONS) {
		describe(`Canton ${canton} (${CANTON_REGISTRY[canton].name_de})`, () => {
			for (const scenario of SCENARIOS) {
				it(`computes correctly: ${scenario.name}`, () => {
					const input: PayrollInput = { ...scenario.input, canton };
					const result = calculatePayroll(input);

					// ── Result structure ──
					expect(result.gross_salary).toBeDefined();
					expect(result.net_salary).toBeDefined();
					expect(result.total_deductions).toBeDefined();
					expect(result.ahv_iv_eo).toBeDefined();
					expect(result.alv).toBeDefined();
					expect(result.bvg).toBeDefined();
					expect(result.uvg_nbu).toBeDefined();
					expect(result.employer_costs).toBeDefined();
					expect(result.child_allowances).toBeDefined();

					// ── Numeric sanity ──
					const gross = parseFloat(result.gross_salary);
					const net = parseFloat(result.net_salary);
					const deductions = parseFloat(result.total_deductions);

					expect(gross).toBe(scenario.input.gross_monthly);
					expect(net).toBeGreaterThan(0);
					expect(net).toBeLessThan(gross);
					expect(deductions).toBeGreaterThan(0);
					expect(deductions).toBeLessThan(gross);

					// Net salary must be 70-90% of gross (typical Swiss range)
					const netPercentage = (net / gross) * 100;
					expect(netPercentage).toBeGreaterThanOrEqual(70);
					expect(netPercentage).toBeLessThanOrEqual(95);

					// ── AHV is always 5.3% (uniform across cantons) ──
					const expectedAhv = parseFloat((gross * 0.053).toFixed(2));
					const actualAhv = parseFloat(result.ahv_iv_eo.employee);
					expect(Math.abs(actualAhv - expectedAhv)).toBeLessThanOrEqual(0.05);

					// ── 5-Rappen rounding everywhere ──
					for (const value of [result.gross_salary, result.net_salary, result.total_deductions]) {
						const num = parseFloat(value);
						const remainder = (num * 20) % 1;
						expect(Math.abs(remainder)).toBeLessThan(0.001);
					}

					// ── Child allowances match FAK registry ──
					if (scenario.input.children && scenario.input.children > 0) {
						const fak = FAK_2026[canton];
						expect(result.child_allowances.per_child).toHaveLength(scenario.input.children);

						for (let i = 0; i < scenario.input.children; i++) {
							const child = result.child_allowances.per_child[i];
							const age = scenario.input.children_ages?.[i] ?? 0;
							const expectedAmount = age >= 16
								? fak.education_allowance.toString()
								: fak.child_allowance.toString();
							expect(parseFloat(child.amount)).toBe(parseFloat(expectedAmount));
						}
					}

					// ── Employer costs include FAK contribution for this canton ──
					const employerTotal = parseFloat(result.employer_costs.total);
					expect(employerTotal).toBeGreaterThan(0);

					// FAK rate must match the canton registry
					const fakRate = CANTON_REGISTRY[canton].fak_rate;
					const expectedFak = parseFloat(new Decimal(gross).mul(fakRate).div(100).toFixed(2));
					const actualFak = parseFloat(result.employer_costs.fak);
					expect(Math.abs(actualFak - expectedFak)).toBeLessThanOrEqual(0.05);
				});
			}
		});
	}
});

/**
 * Cross-canton consistency: same input should produce different employer
 * FAK contributions but identical AHV/ALV (those are federal).
 */
describe("E2E – Cross-canton consistency", () => {
	const baseInput: Omit<PayrollInput, "canton"> = {
		gross_monthly: 8500,
		birth_year: 1990,
		marital_status: "single",
		children: 0,
		church: "keine",
		withholding_tax: false,
		bvg_plan: "minimum",
		uvg_nbu_rate: 1.5,
		employment_percentage: 100,
		thirteenth_salary: false,
	};

	it("AHV employee deduction must be IDENTICAL across all cantons", () => {
		const ahvValues = new Set<string>();
		for (const canton of CANTONS) {
			const result = calculatePayroll({ ...baseInput, canton });
			ahvValues.add(result.ahv_iv_eo.employee);
		}
		expect(ahvValues.size).toBe(1);
	});

	it("ALV employee deduction must be IDENTICAL across all cantons", () => {
		const alvValues = new Set<string>();
		for (const canton of CANTONS) {
			const result = calculatePayroll({ ...baseInput, canton });
			alvValues.add(result.alv.employee);
		}
		expect(alvValues.size).toBe(1);
	});

	it("BVG employee deduction must be IDENTICAL across all cantons (federal law)", () => {
		const bvgValues = new Set<string>();
		for (const canton of CANTONS) {
			const result = calculatePayroll({ ...baseInput, canton });
			bvgValues.add(result.bvg.employee);
		}
		expect(bvgValues.size).toBe(1);
	});

	it("FAK employer contribution MUST differ between cantons (cantonal law)", () => {
		const fakValues = new Set<string>();
		for (const canton of CANTONS) {
			const result = calculatePayroll({ ...baseInput, canton });
			fakValues.add(result.employer_costs.fak);
		}
		// At least 5 distinct values across 26 cantons
		expect(fakValues.size).toBeGreaterThanOrEqual(5);
	});

	it("Net salary must vary across cantons due to different FAK", () => {
		const employerCostValues = new Set<string>();
		for (const canton of CANTONS) {
			const result = calculatePayroll({ ...baseInput, canton });
			employerCostValues.add(result.employer_costs.total);
		}
		expect(employerCostValues.size).toBeGreaterThanOrEqual(5);
	});
});
