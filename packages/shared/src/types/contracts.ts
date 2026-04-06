import type { CantonCode, Locale } from "./common.js";

export type ContractType =
	| "employment-permanent"
	| "employment-fixed-term"
	| "freelancer"
	| "nda"
	| "termination-agreement"
	| "internship"
	| "ceo-contract"
	| "shareholder-agreement"
	| "service-agreement-b2b"
	| "commercial-lease";

export interface ContractInput {
	type: ContractType;
	language: Locale;
	canton: CantonCode;
	parties: ContractParty[];
	parameters: Record<string, unknown>;
}

export interface ContractParty {
	role: "employer" | "employee" | "contractor" | "client" | "landlord" | "tenant" | "shareholder";
	name: string;
	address: string;
	city: string;
	postal_code: string;
}

export interface ContractResult {
	docx_base64: string;
	pdf_base64: string;
	warnings: string[];
	required_clauses_present: boolean;
	disclaimer: string;
}
