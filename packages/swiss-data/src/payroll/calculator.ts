import Decimal from "decimal.js";
import type { PayrollInput, PayrollResult, DeductionDetail, EmployerCosts, ChildAllowanceDetail } from "@rappen/shared";
import { roundTo5Rappen, toChf, percentOf } from "@rappen/shared";
import { AHV_2026 } from "../social-insurance/ahv.js";
import { ALV_2026 } from "../social-insurance/alv.js";
import { BVG_2026, getBvgAgeCredit } from "../social-insurance/bvg.js";
import { UVG_2026 } from "../social-insurance/uvg.js";
import { FAK_2026 } from "../social-insurance/fak.js";

/**
 * Complete Swiss payroll calculation engine.
 *
 * Calculates all social insurance deductions (AHV/IV/EO, ALV, BVG, UVG, KTG),
 * child allowances (FAK), and net salary for all 26 cantons.
 *
 * All monetary calculations use decimal.js — never JavaScript floats.
 * All final CHF amounts are rounded to 5 Rappen.
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
	const currentYear = 2026;
	const age = currentYear - input.birth_year;
	const gross = new Decimal(input.gross_monthly);

	// Annual gross for threshold calculations
	const monthlyFactor = input.thirteenth_salary ? new Decimal("13") : new Decimal("12");
	const annualGross = gross.mul(monthlyFactor).add(new Decimal(input.bonus ?? 0));
	const monthlyGrossForDeductions = gross; // Deductions are on monthly gross

	// ──────────────────────────────────────────────
	// 1. AHV/IV/EO
	// ──────────────────────────────────────────────
	const ahv = calculateAhv(monthlyGrossForDeductions, age);

	// ──────────────────────────────────────────────
	// 2. ALV
	// ──────────────────────────────────────────────
	const alv = calculateAlv(monthlyGrossForDeductions, annualGross, input.employment_percentage);

	// ──────────────────────────────────────────────
	// 3. BVG (Berufliche Vorsorge)
	// ──────────────────────────────────────────────
	const bvg = calculateBvg(monthlyGrossForDeductions, annualGross, age, input.employment_percentage, input.bvg_plan, input.bvg_custom_rate);

	// ──────────────────────────────────────────────
	// 4. UVG NBU (Nichtberufsunfall)
	// ──────────────────────────────────────────────
	const uvgNbu = calculateUvgNbu(monthlyGrossForDeductions, annualGross, input.uvg_nbu_rate);

	// ──────────────────────────────────────────────
	// 5. KTG (optional)
	// ──────────────────────────────────────────────
	const ktg = input.ktg_rate != null ? calculateKtg(monthlyGrossForDeductions, input.ktg_rate) : undefined;

	// ──────────────────────────────────────────────
	// 6. Child allowances (FAK)
	// ──────────────────────────────────────────────
	const childAllowances = calculateChildAllowances(input.canton, input.children, input.children_ages);

	// ──────────────────────────────────────────────
	// 7. Employer costs (FAK contribution)
	// ──────────────────────────────────────────────
	const fakRate = FAK_2026[input.canton].employer_rate;
	const fakContribution = percentOf(monthlyGrossForDeductions, fakRate);

	// ──────────────────────────────────────────────
	// Totals
	// ──────────────────────────────────────────────
	let totalDeductionsEmployee = new Decimal(0)
		.add(new Decimal(ahv.employee))
		.add(new Decimal(alv.employee))
		.add(new Decimal(bvg.employee))
		.add(new Decimal(uvgNbu.employee));

	if (ktg) {
		totalDeductionsEmployee = totalDeductionsEmployee.add(new Decimal(ktg.employee));
	}

	// ALV solidarity (if applicable)
	const alvSolidarity = calculateAlvSolidarity(monthlyGrossForDeductions, annualGross, input.employment_percentage);

	if (alvSolidarity) {
		totalDeductionsEmployee = totalDeductionsEmployee.add(new Decimal(alvSolidarity.employee));
	}

	const netSalary = roundTo5Rappen(gross.sub(totalDeductionsEmployee));
	const totalPayout = roundTo5Rappen(netSalary.add(new Decimal(childAllowances.total_monthly)));

	const employerCosts: EmployerCosts = {
		ahv_iv_eo: ahv.employer,
		alv: alv.employer,
		alv_solidarity: alvSolidarity?.employer,
		bvg: bvg.employer,
		uvg_bu: toChf(0), // BU rate is employer-specific, not in input
		uvg_nbu: uvgNbu.employer !== "0.00" ? uvgNbu.employer : undefined,
		ktg: ktg?.employer,
		fak: toChf(fakContribution),
		total: toChf(
			new Decimal(ahv.employer)
				.add(new Decimal(alv.employer))
				.add(alvSolidarity ? new Decimal(alvSolidarity.employer) : 0)
				.add(new Decimal(bvg.employer))
				.add(new Decimal(uvgNbu.employer))
				.add(ktg ? new Decimal(ktg.employer) : 0)
				.add(fakContribution)
		),
	};

	return {
		gross_salary: toChf(gross),
		ahv_iv_eo: ahv,
		alv,
		alv_solidarity: alvSolidarity ?? undefined,
		bvg,
		uvg_nbu: uvgNbu,
		ktg,
		total_deductions: toChf(totalDeductionsEmployee),
		net_salary: toChf(netSalary),
		employer_costs: employerCosts,
		child_allowances: childAllowances,
		total_payout: toChf(totalPayout),
	};
}

// ════════════════════════════════════════════════════════════════
// Individual calculation functions
// ════════════════════════════════════════════════════════════════

function calculateAhv(monthlyGross: Decimal, age: number): DeductionDetail {
	let basis = monthlyGross;

	// Retirees (age 65+ for men, 64+ for women – using 65 for simplicity)
	// [VERIFY] Check if reference age is 65 for both genders in 2026 (AHV21 reform)
	if (age >= 65) {
		const monthlyExemption = AHV_2026.retiree_monthly_exemption;
		basis = Decimal.max(basis.sub(monthlyExemption), new Decimal(0));
	}

	const employeeAmount = roundTo5Rappen(percentOf(basis, AHV_2026.employee_rate));
	const employerAmount = roundTo5Rappen(percentOf(basis, AHV_2026.employer_rate));

	return {
		employee: toChf(employeeAmount),
		employer: toChf(employerAmount),
		rate_employee: AHV_2026.employee_rate.toString() + "%",
		rate_employer: AHV_2026.employer_rate.toString() + "%",
		basis: toChf(basis),
		legal_basis: AHV_2026.legal_basis,
	};
}

function calculateAlv(monthlyGross: Decimal, annualGross: Decimal, employmentPercentage: number): DeductionDetail {
	// ALV is capped at max insured annual salary (pro rata for monthly)
	const maxMonthly = ALV_2026.max_insured_annual.div(12);
	const basis = Decimal.min(monthlyGross, maxMonthly);

	const employeeAmount = roundTo5Rappen(percentOf(basis, ALV_2026.employee_rate));
	const employerAmount = roundTo5Rappen(percentOf(basis, ALV_2026.employer_rate));

	return {
		employee: toChf(employeeAmount),
		employer: toChf(employerAmount),
		rate_employee: ALV_2026.employee_rate.toString() + "%",
		rate_employer: ALV_2026.employer_rate.toString() + "%",
		basis: toChf(basis),
		legal_basis: ALV_2026.legal_basis,
	};
}

function calculateAlvSolidarity(monthlyGross: Decimal, annualGross: Decimal, employmentPercentage: number): DeductionDetail | null {
	// Solidarity surcharge applies on salary above max_insured_annual
	const maxMonthly = ALV_2026.max_insured_annual.div(12);

	if (monthlyGross.lte(maxMonthly)) {
		return null;
	}

	const solidarityBasis = monthlyGross.sub(maxMonthly);
	const employeeAmount = roundTo5Rappen(percentOf(solidarityBasis, ALV_2026.solidarity.employee_rate));
	const employerAmount = roundTo5Rappen(percentOf(solidarityBasis, ALV_2026.solidarity.employer_rate));

	return {
		employee: toChf(employeeAmount),
		employer: toChf(employerAmount),
		rate_employee: ALV_2026.solidarity.employee_rate.toString() + "%",
		rate_employer: ALV_2026.solidarity.employer_rate.toString() + "%",
		basis: toChf(solidarityBasis),
		legal_basis: "AVIG Art. 3 Abs. 2 (Solidaritätsbeitrag)",
	};
}

function calculateBvg(
	monthlyGross: Decimal,
	annualGross: Decimal,
	age: number,
	employmentPercentage: number,
	plan: "minimum" | "standard" | "custom",
	customRate?: number,
): DeductionDetail {
	// No BVG if under 25 or annual salary below entry threshold
	const ageCredit = getBvgAgeCredit(age);
	if (!ageCredit || annualGross.lt(BVG_2026.entry_threshold)) {
		return {
			employee: "0.00",
			employer: "0.00",
			rate_employee: "0%",
			rate_employer: "0%",
			basis: "0.00",
			legal_basis: age < 25
				? "BVG Art. 7 (Mindestalter 25)"
				: "BVG Art. 7 (Eintrittsschwelle nicht erreicht)",
		};
	}

	// Coordinated salary (annual)
	// For part-time: coordination deduction is adjusted proportionally
	const partTimeFactor = new Decimal(employmentPercentage).div(100);
	const adjustedCoordDeduction = BVG_2026.coordination_deduction.mul(partTimeFactor);

	let coordinatedSalaryAnnual = annualGross.sub(adjustedCoordDeduction);

	// Ensure minimum coordinated salary
	coordinatedSalaryAnnual = Decimal.max(coordinatedSalaryAnnual, BVG_2026.min_coordinated_salary);

	// Cap at maximum insured salary minus coordination deduction
	const maxCoordinated = BVG_2026.max_insured_salary.sub(adjustedCoordDeduction);
	coordinatedSalaryAnnual = Decimal.min(coordinatedSalaryAnnual, maxCoordinated);

	// Monthly coordinated salary
	const coordinatedMonthly = coordinatedSalaryAnnual.div(12);

	// Determine rate
	let totalRate: Decimal;
	if (plan === "custom" && customRate != null) {
		totalRate = new Decimal(customRate);
	} else {
		totalRate = ageCredit; // minimum BVG
	}

	// Split: minimum 50% employer (we use 50/50 for minimum, can be adjusted)
	const employerShare = new Decimal("50"); // 50% of total
	const employeeRate = totalRate.mul(new Decimal(100).sub(employerShare)).div(100);
	const employerRate = totalRate.mul(employerShare).div(100);

	const employeeAmount = roundTo5Rappen(percentOf(coordinatedMonthly, employeeRate.mul(100).div(totalRate).mul(totalRate).div(100)));
	// Simpler: just split the total contribution
	const totalContribution = percentOf(coordinatedMonthly, totalRate);
	const employeeContrib = roundTo5Rappen(totalContribution.div(2));
	const employerContrib = roundTo5Rappen(totalContribution.sub(employeeContrib));

	return {
		employee: toChf(employeeContrib),
		employer: toChf(employerContrib),
		rate_employee: totalRate.div(2).toFixed(2) + "%",
		rate_employer: totalRate.div(2).toFixed(2) + "%",
		basis: toChf(coordinatedMonthly),
		legal_basis: BVG_2026.legal_basis,
	};
}

function calculateUvgNbu(monthlyGross: Decimal, annualGross: Decimal, nbuRate: number): DeductionDetail {
	// UVG is capped at max insured salary
	const maxMonthly = UVG_2026.max_insured_annual.div(12);
	const basis = Decimal.min(monthlyGross, maxMonthly);

	const rate = new Decimal(nbuRate);
	const employeeAmount = roundTo5Rappen(percentOf(basis, rate));

	return {
		employee: toChf(employeeAmount),
		employer: "0.00", // NBU typically paid by employee
		rate_employee: rate.toString() + "%",
		rate_employer: "0%",
		basis: toChf(basis),
		legal_basis: UVG_2026.legal_basis,
	};
}

function calculateKtg(monthlyGross: Decimal, ktgRate: number): DeductionDetail {
	const rate = new Decimal(ktgRate);
	// KTG is typically split 50/50 between employee and employer
	const halfRate = rate.div(2);
	const employeeAmount = roundTo5Rappen(percentOf(monthlyGross, halfRate));
	const employerAmount = roundTo5Rappen(percentOf(monthlyGross, halfRate));

	return {
		employee: toChf(employeeAmount),
		employer: toChf(employerAmount),
		rate_employee: halfRate.toFixed(2) + "%",
		rate_employer: halfRate.toFixed(2) + "%",
		basis: toChf(monthlyGross),
		legal_basis: "VVG / OR Art. 324a",
	};
}

function calculateChildAllowances(
	canton: PayrollInput["canton"],
	children: number,
	childrenAges?: number[],
): ChildAllowanceDetail {
	const fakRates = FAK_2026[canton];
	const perChild: ChildAllowanceDetail["per_child"] = [];
	let total = new Decimal(0);

	for (let i = 0; i < children; i++) {
		const age = childrenAges?.[i] ?? 0;
		const isEducation = age >= 16;
		const amount = isEducation ? fakRates.education_allowance : fakRates.child_allowance;

		perChild.push({
			age,
			amount: toChf(amount),
			type: isEducation ? "ausbildung" : "kind",
		});

		total = total.add(amount);
	}

	return {
		per_child: perChild,
		total_monthly: toChf(total),
		canton_rate: fakRates.employer_rate.toString() + "%",
	};
}
