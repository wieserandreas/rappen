import { describe, it, expect } from "vitest";
import { analyzePayEquity } from "@rappen/swiss-data";
import type { PayEquityInput, PayEquityEmployee } from "@rappen/shared";

function makeEmployee(gender: "M" | "F", salary: number, overrides: Partial<PayEquityEmployee> = {}): PayEquityEmployee {
	return {
		id: `emp_${Math.random().toString(36).slice(2, 8)}`,
		gender,
		salary_monthly: salary,
		education_level: 3,
		potential_experience_years: 10,
		service_years: 5,
		skill_level: 2,
		professional_position: 3,
		employment_percentage: 100,
		...overrides,
	};
}

function makeInput(employees: PayEquityEmployee[]): PayEquityInput {
	return {
		employees,
		company_name: "Test AG",
		analysis_date: "2026-01-01",
	};
}

describe("Pay Equity – Input Validation", () => {
	it("should reject fewer than 10 employees", () => {
		const employees = [
			makeEmployee("M", 8000),
			makeEmployee("F", 7500),
		];
		expect(() => analyzePayEquity(makeInput(employees))).toThrow(/Mindestens 10/);
	});

	it("should reject single-gender datasets", () => {
		const employees = Array.from({ length: 10 }, (_, i) =>
			makeEmployee("M", 7000 + i * 200),
		);
		expect(() => analyzePayEquity(makeInput(employees))).toThrow(/pro Geschlecht/);
	});
});

describe("Pay Equity – Equal Pay Scenario", () => {
	it("should find compliance when salaries are equal", () => {
		const employees = [
			// Varied qualifications, but equal pay for equal work
			makeEmployee("M", 7500, { education_level: 2, potential_experience_years: 5, service_years: 2, skill_level: 1, professional_position: 2 }),
			makeEmployee("M", 8500, { education_level: 3, potential_experience_years: 10, service_years: 5, skill_level: 2, professional_position: 3 }),
			makeEmployee("M", 9500, { education_level: 4, potential_experience_years: 15, service_years: 8, skill_level: 3, professional_position: 4 }),
			makeEmployee("M", 10500, { education_level: 5, potential_experience_years: 20, service_years: 12, skill_level: 4, professional_position: 5 }),
			makeEmployee("M", 8000, { education_level: 3, potential_experience_years: 8, service_years: 4, skill_level: 2, professional_position: 2 }),
			makeEmployee("M", 9000, { education_level: 4, potential_experience_years: 12, service_years: 6, skill_level: 3, professional_position: 3 }),
			makeEmployee("F", 7500, { education_level: 2, potential_experience_years: 5, service_years: 2, skill_level: 1, professional_position: 2 }),
			makeEmployee("F", 8500, { education_level: 3, potential_experience_years: 10, service_years: 5, skill_level: 2, professional_position: 3 }),
			makeEmployee("F", 9500, { education_level: 4, potential_experience_years: 15, service_years: 8, skill_level: 3, professional_position: 4 }),
			makeEmployee("F", 10500, { education_level: 5, potential_experience_years: 20, service_years: 12, skill_level: 4, professional_position: 5 }),
			makeEmployee("F", 8000, { education_level: 3, potential_experience_years: 8, service_years: 4, skill_level: 2, professional_position: 2 }),
			makeEmployee("F", 9000, { education_level: 4, potential_experience_years: 12, service_years: 6, skill_level: 3, professional_position: 3 }),
		];
		const result = analyzePayEquity(makeInput(employees));
		expect(result.compliant).toBe(true);
		expect(result.sample_size).toBe(12);
	});
});

describe("Pay Equity – Significant Gap Scenario", () => {
	it("should detect non-compliance when women earn significantly less", () => {
		const employees = [
			// Men and women with SAME qualifications, but women earn ~20% less
			makeEmployee("M", 9000, { education_level: 2, potential_experience_years: 5, service_years: 3, skill_level: 1, professional_position: 2 }),
			makeEmployee("M", 9500, { education_level: 3, potential_experience_years: 10, service_years: 5, skill_level: 2, professional_position: 3 }),
			makeEmployee("M", 10000, { education_level: 4, potential_experience_years: 15, service_years: 8, skill_level: 3, professional_position: 4 }),
			makeEmployee("M", 10500, { education_level: 5, potential_experience_years: 20, service_years: 12, skill_level: 4, professional_position: 5 }),
			makeEmployee("M", 9200, { education_level: 3, potential_experience_years: 8, service_years: 4, skill_level: 2, professional_position: 2 }),
			makeEmployee("M", 9800, { education_level: 4, potential_experience_years: 12, service_years: 6, skill_level: 3, professional_position: 3 }),
			makeEmployee("F", 7200, { education_level: 2, potential_experience_years: 5, service_years: 3, skill_level: 1, professional_position: 2 }),
			makeEmployee("F", 7600, { education_level: 3, potential_experience_years: 10, service_years: 5, skill_level: 2, professional_position: 3 }),
			makeEmployee("F", 8000, { education_level: 4, potential_experience_years: 15, service_years: 8, skill_level: 3, professional_position: 4 }),
			makeEmployee("F", 8400, { education_level: 5, potential_experience_years: 20, service_years: 12, skill_level: 4, professional_position: 5 }),
			makeEmployee("F", 7400, { education_level: 3, potential_experience_years: 8, service_years: 4, skill_level: 2, professional_position: 2 }),
			makeEmployee("F", 7800, { education_level: 4, potential_experience_years: 12, service_years: 6, skill_level: 3, professional_position: 3 }),
		];
		const result = analyzePayEquity(makeInput(employees));
		expect(result.compliant).toBe(false);
		expect(parseFloat(result.unexplained_gap_percent)).toBeLessThan(-5); // >5% gap
		expect(result.recommendation).toContain("Toleranzschwelle");
	});
});

describe("Pay Equity – Result Structure", () => {
	it("should return all required fields", () => {
		const employees = [
			makeEmployee("M", 8000, { education_level: 2, potential_experience_years: 5, service_years: 2, skill_level: 1, professional_position: 2 }),
			makeEmployee("M", 9000, { education_level: 3, potential_experience_years: 10, service_years: 5, skill_level: 2, professional_position: 3 }),
			makeEmployee("M", 10000, { education_level: 4, potential_experience_years: 15, service_years: 8, skill_level: 3, professional_position: 4 }),
			makeEmployee("M", 8500, { education_level: 3, potential_experience_years: 8, service_years: 4, skill_level: 2, professional_position: 2 }),
			makeEmployee("M", 9500, { education_level: 4, potential_experience_years: 12, service_years: 7, skill_level: 3, professional_position: 3 }),
			makeEmployee("M", 11000, { education_level: 5, potential_experience_years: 20, service_years: 10, skill_level: 4, professional_position: 5 }),
			makeEmployee("F", 7800, { education_level: 2, potential_experience_years: 6, service_years: 3, skill_level: 1, professional_position: 2 }),
			makeEmployee("F", 8800, { education_level: 3, potential_experience_years: 11, service_years: 6, skill_level: 2, professional_position: 3 }),
			makeEmployee("F", 9800, { education_level: 4, potential_experience_years: 14, service_years: 7, skill_level: 3, professional_position: 4 }),
			makeEmployee("F", 8300, { education_level: 3, potential_experience_years: 9, service_years: 5, skill_level: 2, professional_position: 2 }),
			makeEmployee("F", 9300, { education_level: 4, potential_experience_years: 13, service_years: 8, skill_level: 3, professional_position: 3 }),
			makeEmployee("F", 10800, { education_level: 5, potential_experience_years: 19, service_years: 11, skill_level: 4, professional_position: 5 }),
		];
		const result = analyzePayEquity(makeInput(employees));

		expect(result.gender_coefficient).toBeDefined();
		expect(result.tolerance_threshold).toBe("5.0%");
		expect(result.t_statistic).toBeDefined();
		expect(result.p_value).toBeDefined();
		expect(result.sample_size).toBe(12);
		expect(result.unexplained_gap_percent).toBeDefined();
		expect(result.regression_details.r_squared).toBeDefined();
		expect(result.regression_details.coefficients).toBeDefined();
		expect(result.regression_details.coefficients.gender).toBeDefined();
		expect(result.regression_details.coefficients.intercept).toBeDefined();
		expect(result.legal_basis).toContain("GlG Art. 13 (Gleichstellungsgesetz)");
	});
});
