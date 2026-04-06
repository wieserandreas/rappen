import { describe, it, expect } from "vitest";
import Decimal from "decimal.js";
import { roundTo5Rappen, percentOf } from "@rappen/shared";
import { AHV_2026 } from "@rappen/swiss-data";
import { ALV_2026 } from "@rappen/swiss-data";
import { BVG_2026, getBvgAgeCredit } from "@rappen/swiss-data";
import { calculatePayroll } from "@rappen/swiss-data";
import type { PayrollInput } from "@rappen/shared";

// ════════════════════════════════════════════════════════════
// Helper: create a standard input for testing
// ════════════════════════════════════════════════════════════
function makeInput(overrides: Partial<PayrollInput> = {}): PayrollInput {
	return {
		canton: "ZH",
		gross_monthly: 8500,
		birth_year: 1990, // age 36 in 2026
		marital_status: "single",
		children: 0,
		church: "keine",
		withholding_tax: false,
		bvg_plan: "minimum",
		uvg_nbu_rate: 1.5,
		employment_percentage: 100,
		thirteenth_salary: false,
		...overrides,
	};
}

// ════════════════════════════════════════════════════════════
// Social Insurance Constants
// ════════════════════════════════════════════════════════════
describe("Social Insurance Constants", () => {
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

// ════════════════════════════════════════════════════════════
// Swiss 5-Rappen Rounding
// ════════════════════════════════════════════════════════════
describe("Swiss 5-Rappen Rounding", () => {
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

// ════════════════════════════════════════════════════════════
// Full Payroll Calculation – Standard Case
// ════════════════════════════════════════════════════════════
describe("Payroll Calculation – Standard Case (ZH, CHF 8500, age 36, single, no children)", () => {
	const input = makeInput();
	const result = calculatePayroll(input);

	it("should return gross salary", () => {
		expect(result.gross_salary).toBe("8500.00");
	});

	it("should calculate AHV/IV/EO correctly (5.3% of 8500)", () => {
		// 8500 * 5.3% = 450.50 → rounded to 5 Rappen = 450.50
		expect(result.ahv_iv_eo.employee).toBe("450.50");
		expect(result.ahv_iv_eo.employer).toBe("450.50");
	});

	it("should calculate ALV correctly (1.1% of 8500)", () => {
		// 8500 * 1.1% = 93.50
		expect(result.alv.employee).toBe("93.50");
		expect(result.alv.employer).toBe("93.50");
	});

	it("should not have ALV solidarity for salary below threshold", () => {
		// 8500 * 12 = 102000 < 148200 → no solidarity
		expect(result.alv_solidarity).toBeUndefined();
	});

	it("should calculate BVG correctly for age 36 (10% rate)", () => {
		// Age 36 → 35-44 bracket → 10% total → 5%/5%
		// Annual gross: 8500 * 12 = 102000
		// Capped at max_insured: min(102000, 88200) = 88200
		// Coordinated salary: 88200 - 25725 = 62475 (annual)
		// Monthly coordinated: 62475 / 12 = 5206.25
		const bvgBasis = parseFloat(result.bvg.basis);
		expect(bvgBasis).toBeCloseTo(5206.25, 0);
		expect(parseFloat(result.bvg.employee)).toBeGreaterThan(0);
		expect(result.bvg.rate_employee).toContain("5.00");
	});

	it("should calculate UVG NBU correctly (1.5% of 8500)", () => {
		// 8500 * 1.5% = 127.50
		expect(result.uvg_nbu.employee).toBe("127.50");
	});

	it("should have no KTG (not provided)", () => {
		expect(result.ktg).toBeUndefined();
	});

	it("should have no child allowances", () => {
		expect(result.child_allowances.total_monthly).toBe("0.00");
	});

	it("should calculate net salary correctly", () => {
		const gross = parseFloat(result.gross_salary);
		const deductions = parseFloat(result.total_deductions);
		const net = parseFloat(result.net_salary);
		expect(net).toBeCloseTo(gross - deductions, 1);
		expect(net).toBeGreaterThan(0);
		expect(net).toBeLessThan(gross);
	});

	it("should calculate employer costs", () => {
		expect(parseFloat(result.employer_costs.total)).toBeGreaterThan(0);
		expect(result.employer_costs.fak).toBeDefined();
	});
});

// ════════════════════════════════════════════════════════════
// Child Allowances
// ════════════════════════════════════════════════════════════
describe("Payroll – Child Allowances per Canton", () => {
	it("ZH: CHF 200/child, CHF 250/education", () => {
		const result = calculatePayroll(makeInput({ canton: "ZH", children: 2, children_ages: [5, 17] }));
		expect(result.child_allowances.per_child).toHaveLength(2);
		expect(result.child_allowances.per_child[0].amount).toBe("200.00");
		expect(result.child_allowances.per_child[0].type).toBe("kind");
		expect(result.child_allowances.per_child[1].amount).toBe("250.00");
		expect(result.child_allowances.per_child[1].type).toBe("ausbildung");
		expect(result.child_allowances.total_monthly).toBe("450.00");
	});

	it("VS: CHF 375/child, CHF 475/education (highest in CH)", () => {
		const result = calculatePayroll(makeInput({ canton: "VS", children: 1, children_ages: [3] }));
		expect(result.child_allowances.per_child[0].amount).toBe("375.00");
		expect(result.child_allowances.total_monthly).toBe("375.00");
	});

	it("GE: CHF 311/child, CHF 415/education", () => {
		const result = calculatePayroll(makeInput({ canton: "GE", children: 1, children_ages: [18] }));
		expect(result.child_allowances.per_child[0].amount).toBe("415.00");
		expect(result.child_allowances.per_child[0].type).toBe("ausbildung");
	});

	it("VD: CHF 300/child, CHF 400/education", () => {
		const result = calculatePayroll(makeInput({ canton: "VD", children: 3, children_ages: [2, 8, 20] }));
		expect(result.child_allowances.per_child[0].amount).toBe("300.00");
		expect(result.child_allowances.per_child[1].amount).toBe("300.00");
		expect(result.child_allowances.per_child[2].amount).toBe("400.00");
		expect(result.child_allowances.total_monthly).toBe("1000.00");
	});

	it("ZG: CHF 300/child, CHF 350/education", () => {
		const result = calculatePayroll(makeInput({ canton: "ZG", children: 1, children_ages: [10] }));
		expect(result.child_allowances.per_child[0].amount).toBe("300.00");
	});
});

// ════════════════════════════════════════════════════════════
// Edge Cases
// ════════════════════════════════════════════════════════════
describe("Payroll – Edge Cases", () => {
	it("should handle 13th salary (annual gross is higher)", () => {
		const without13 = calculatePayroll(makeInput({ thirteenth_salary: false }));
		const with13 = calculatePayroll(makeInput({ thirteenth_salary: true }));
		// BVG basis should be different (higher annual → higher coordinated)
		// Net salary per month stays the same (13th is a separate payment)
		expect(without13.gross_salary).toBe(with13.gross_salary);
	});

	it("should handle part-time (50%)", () => {
		const result = calculatePayroll(makeInput({
			gross_monthly: 4250, // 50% of 8500
			employment_percentage: 50,
		}));
		expect(result.gross_salary).toBe("4250.00");
		// AHV: 4250 * 5.3% = 225.25
		expect(result.ahv_iv_eo.employee).toBe("225.25");
	});

	it("should handle salary below BVG entry threshold", () => {
		// BVG threshold: 22050/year → 1837.50/month
		const result = calculatePayroll(makeInput({ gross_monthly: 1500 }));
		expect(result.bvg.employee).toBe("0.00");
		expect(result.bvg.employer).toBe("0.00");
	});

	it("should handle young worker under 25 (no BVG)", () => {
		const result = calculatePayroll(makeInput({ birth_year: 2003 })); // age 23
		expect(result.bvg.employee).toBe("0.00");
	});

	it("should handle high salary with ALV solidarity surcharge", () => {
		// ALV max: 148200/year → 12350/month
		const result = calculatePayroll(makeInput({ gross_monthly: 15000 }));
		expect(result.alv_solidarity).toBeDefined();
		expect(parseFloat(result.alv_solidarity!.employee)).toBeGreaterThan(0);
		// ALV basis should be capped at 12350
		expect(parseFloat(result.alv.basis)).toBeCloseTo(12350, 0);
	});

	it("should handle KTG when provided", () => {
		const result = calculatePayroll(makeInput({ ktg_rate: 2.0 }));
		expect(result.ktg).toBeDefined();
		// KTG 2% split 50/50 → 1% each on 8500 = 85.00
		expect(result.ktg!.employee).toBe("85.00");
		expect(result.ktg!.employer).toBe("85.00");
	});

	it("should handle bonus", () => {
		const withoutBonus = calculatePayroll(makeInput());
		const withBonus = calculatePayroll(makeInput({ bonus: 5000 }));
		// Bonus affects annual gross → BVG coordinated salary may change
		expect(withoutBonus.gross_salary).toBe(withBonus.gross_salary);
		// Monthly deductions for AHV/ALV stay the same (based on monthly gross)
		expect(withoutBonus.ahv_iv_eo.employee).toBe(withBonus.ahv_iv_eo.employee);
	});

	it("should handle retiree with AHV exemption", () => {
		const result = calculatePayroll(makeInput({ birth_year: 1960 })); // age 66
		// AHV basis should be reduced by Freibetrag (1400/month)
		// 8500 - 1400 = 7100
		const ahvBasis = parseFloat(result.ahv_iv_eo.basis);
		expect(ahvBasis).toBeCloseTo(7100, 0);
	});

	it("should apply BVG age bracket 25-34 (7%)", () => {
		const result = calculatePayroll(makeInput({ birth_year: 1996 })); // age 30
		expect(result.bvg.rate_employee).toContain("3.50");
	});

	it("should apply BVG age bracket 45-54 (15%)", () => {
		const result = calculatePayroll(makeInput({ birth_year: 1976 })); // age 50
		expect(result.bvg.rate_employee).toContain("7.50");
	});

	it("should apply BVG age bracket 55-65 (18%)", () => {
		const result = calculatePayroll(makeInput({ birth_year: 1966 })); // age 60
		expect(result.bvg.rate_employee).toContain("9.00");
	});
});
