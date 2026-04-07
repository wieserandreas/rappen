"use server";

import type { CrossBorderInput, CrossBorderResult, NeighborCountry } from "@rappen/shared";
import { CANTONS } from "@rappen/shared";
import { calculateCrossBorder } from "@rappen/swiss-data";

export interface CrossBorderActionResult {
	success: boolean;
	data?: CrossBorderResult;
	error?: string;
}

const VALID_COUNTRIES: NeighborCountry[] = ["DE", "FR", "IT", "AT", "LI"];

export async function calculateCrossBorderAction(formData: FormData): Promise<CrossBorderActionResult> {
	const country = String(formData.get("residence_country") ?? "");
	const canton = String(formData.get("work_canton") ?? "");

	if (!VALID_COUNTRIES.includes(country as NeighborCountry)) {
		return { success: false, error: "Bitte einen gültigen Wohnsitzstaat wählen." };
	}
	if (!CANTONS.includes(canton as (typeof CANTONS)[number])) {
		return { success: false, error: "Bitte einen gültigen Arbeitskanton wählen." };
	}

	const grossAnnual = parseFloat(String(formData.get("gross_annual") ?? "0"));
	const totalDays = parseInt(String(formData.get("total_work_days") ?? "220"), 10);
	const teleworkDays = parseInt(String(formData.get("telework_days") ?? "0"), 10);

	if (isNaN(grossAnnual) || grossAnnual <= 0) {
		return { success: false, error: "Bitte einen gültigen Jahreslohn angeben." };
	}
	if (totalDays <= 0 || totalDays > 366) {
		return { success: false, error: "Arbeitstage müssen zwischen 1 und 366 liegen." };
	}
	if (teleworkDays < 0 || teleworkDays > totalDays) {
		return { success: false, error: "Telework-Tage dürfen nicht grösser als Total Arbeitstage sein." };
	}

	const input: CrossBorderInput = {
		residence_country: country as NeighborCountry,
		work_canton: canton as CrossBorderInput["work_canton"],
		gross_annual: grossAnnual,
		telework_days_per_year: teleworkDays,
		total_work_days_per_year: totalDays,
		marital_status: String(formData.get("marital_status") ?? "single") as "single" | "married",
		children: parseInt(String(formData.get("children") ?? "0"), 10),
		nationality: String(formData.get("nationality") ?? country).toUpperCase(),
		has_g_permit: formData.get("has_g_permit") === "on",
	};

	try {
		const data = calculateCrossBorder(input);
		return { success: true, data };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Berechnungsfehler",
		};
	}
}
