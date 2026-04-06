export type VatRateType = "normal" | "reduced" | "accommodation" | "exempt";

export interface VatCalculationInput {
	transactions: VatTransaction[];
	method: "effective" | "saldo" | "pauschal";
	saldo_rate_code?: string;
	period: { from: string; to: string };
	include_reverse_charge: boolean;
}

export interface VatTransaction {
	description: string;
	amount: number;
	rate_type: VatRateType;
	is_import?: boolean;
	is_export?: boolean;
	country_code?: string;
}

export interface VatCalculationResult {
	total_revenue: string;
	total_vat_collected: string;
	total_input_vat: string;
	vat_payable: string;
	reverse_charge?: string;
	optimization_tips: string[];
	breakdown: VatBreakdownLine[];
	legal_basis: string[];
}

export interface VatBreakdownLine {
	rate_type: VatRateType;
	rate: string;
	taxable_amount: string;
	vat_amount: string;
}
