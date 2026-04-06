import type { CantonCode, ChurchAffiliation, MaritalStatus } from "./common.js";

export type TariffCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export interface WithholdingTaxInput {
	canton: CantonCode;
	year: number;
	tariff_code: TariffCode;
	children: number;
	church: ChurchAffiliation;
	gross_monthly: number;
	thirteenth_salary: boolean;
}

export interface WithholdingTaxResult {
	tax_amount: string;
	effective_rate: string;
	tariff_code_full: string;
	canton: CantonCode;
	year: number;
	model: "monthly" | "annual";
	legal_basis: string;
}
