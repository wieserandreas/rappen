import type { CantonCode } from "./common.js";

export type NeighborCountry = "DE" | "FR" | "IT" | "AT" | "LI";

export interface CrossBorderInput {
	residence_country: NeighborCountry;
	work_canton: CantonCode;
	gross_annual: number;
	telework_days_per_year: number;
	total_work_days_per_year: number;
	marital_status: "single" | "married";
	children: number;
	nationality: string;
	has_g_permit: boolean;
}

export interface CrossBorderResult {
	tax_jurisdiction: string;
	social_security_country: string;
	withholding_tax_applicable: boolean;
	telework_threshold_exceeded: boolean;
	telework_percentage: string;
	a1_certificate_required: boolean;
	leads_reporting_required: boolean;
	leads_xml?: string;
	dba_article: string;
	warnings: string[];
	legal_basis: string[];
}
