"use server";

import type { ContractInput, ContractType } from "@rappen/shared";
import { CANTONS } from "@rappen/shared";
import { validateContractInput, prepareContract, CONTRACT_TYPE_NAMES } from "@rappen/swiss-data";

export interface ContractActionResult {
	success: boolean;
	data?: {
		title: string;
		template_name: string;
		required_clauses: string[];
		legal_basis: string[];
		disclaimer: string;
		parties_count: number;
	};
	warnings?: string[];
	error?: string;
}

const VALID_TYPES = new Set(Object.keys(CONTRACT_TYPE_NAMES));
const VALID_CANTONS = new Set(CANTONS);

export async function generateContractAction(formData: FormData): Promise<ContractActionResult> {
	const type = String(formData.get("type") ?? "");
	const language = String(formData.get("language") ?? "de");
	const canton = String(formData.get("canton") ?? "ZH");

	if (!VALID_TYPES.has(type)) {
		return { success: false, error: "Bitte einen gültigen Vertragstyp wählen." };
	}
	if (!VALID_CANTONS.has(canton as (typeof CANTONS)[number])) {
		return { success: false, error: "Ungültiger Kanton." };
	}
	if (!["de", "fr", "it", "en"].includes(language)) {
		return { success: false, error: "Ungültige Sprache." };
	}

	const employerName = String(formData.get("party1_name") ?? "").trim();
	const employerCity = String(formData.get("party1_city") ?? "").trim();
	const employeeName = String(formData.get("party2_name") ?? "").trim();
	const employeeCity = String(formData.get("party2_city") ?? "").trim();

	if (!employerName || !employeeName) {
		return { success: false, error: "Beide Vertragsparteien müssen einen Namen haben." };
	}

	const input: ContractInput = {
		type: type as ContractType,
		language: language as "de" | "fr" | "it" | "en",
		canton: canton as ContractInput["canton"],
		parties: [
			{
				role: "employer",
				name: employerName,
				address: String(formData.get("party1_address") ?? "").trim(),
				city: employerCity,
				postal_code: String(formData.get("party1_postal") ?? "").trim(),
			},
			{
				role: "employee",
				name: employeeName,
				address: String(formData.get("party2_address") ?? "").trim(),
				city: employeeCity,
				postal_code: String(formData.get("party2_postal") ?? "").trim(),
			},
		],
		parameters: {
			start_date: String(formData.get("start_date") ?? ""),
			end_date: String(formData.get("end_date") ?? "") || undefined,
			gross_monthly: parseFloat(String(formData.get("gross_monthly") ?? "0")) || undefined,
			employment_percentage: parseInt(String(formData.get("employment_percentage") ?? "100"), 10),
			notice_period: String(formData.get("notice_period") ?? "1") + " Monat(e)",
			vacation_days: parseInt(String(formData.get("vacation_days") ?? "20"), 10),
			workplace: String(formData.get("workplace") ?? "").trim(),
			job_title: String(formData.get("job_title") ?? "").trim(),
		},
	};

	const validation = validateContractInput(input);
	if (!validation.valid) {
		return {
			success: false,
			error: validation.warnings.join(" · "),
		};
	}

	try {
		const prepared = prepareContract(input);
		return {
			success: true,
			data: {
				title: prepared.title,
				template_name: prepared.template_name,
				required_clauses: prepared.required_clauses,
				legal_basis: prepared.legal_basis,
				disclaimer: prepared.disclaimer,
				parties_count: input.parties.length,
			},
			warnings: validation.warnings,
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Generierungsfehler",
		};
	}
}
