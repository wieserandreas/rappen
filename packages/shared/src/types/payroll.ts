import type { CantonCode, ChurchAffiliation, MaritalStatus } from "./common.js";

export interface PayrollInput {
	canton: CantonCode;
	municipality?: string;
	gross_monthly: number;
	birth_year: number;
	marital_status: MaritalStatus;
	children: number;
	children_ages?: number[];
	church: ChurchAffiliation;
	withholding_tax: boolean;
	bvg_plan: "minimum" | "standard" | "custom";
	bvg_custom_rate?: number;
	uvg_nbu_rate: number;
	ktg_rate?: number;
	employment_percentage: number;
	thirteenth_salary: boolean;
	bonus?: number;
	additional_income?: number;
	correction_month?: string;
}

export interface PayrollResult {
	gross_salary: string;
	ahv_iv_eo: DeductionDetail;
	alv: DeductionDetail;
	alv_solidarity?: DeductionDetail;
	bvg: DeductionDetail;
	uvg_nbu: DeductionDetail;
	ktg?: DeductionDetail;
	withholding_tax?: DeductionDetail;
	total_deductions: string;
	net_salary: string;
	employer_costs: EmployerCosts;
	child_allowances: ChildAllowanceDetail;
	total_payout: string;
}

export interface DeductionDetail {
	employee: string;
	employer: string;
	rate_employee: string;
	rate_employer: string;
	basis: string;
	legal_basis: string;
}

export interface EmployerCosts {
	ahv_iv_eo: string;
	alv: string;
	alv_solidarity?: string;
	bvg: string;
	uvg_bu: string;
	uvg_nbu?: string;
	ktg?: string;
	fak: string;
	total: string;
}

export interface ChildAllowanceDetail {
	per_child: { age: number; amount: string; type: "kind" | "ausbildung" }[];
	total_monthly: string;
	canton_rate: string;
}
