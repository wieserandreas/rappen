"use server";

import type { TempStaffingInput, TempStaffingResult } from "@rappen/shared";
import { CANTONS } from "@rappen/shared";
import { validateTempStaffing } from "@rappen/swiss-data";

export interface TempStaffingActionResult {
	success: boolean;
	data?: TempStaffingResult;
	error?: string;
}

const VALID_PERMITS = ["B", "C", "G", "L", "F", "N", "S", "CH"] as const;

export async function validateTempStaffingAction(formData: FormData): Promise<TempStaffingActionResult> {
	const canton = String(formData.get("canton") ?? "");
	if (!CANTONS.includes(canton as (typeof CANTONS)[number])) {
		return { success: false, error: "Bitte einen gültigen Kanton wählen." };
	}

	const permit = String(formData.get("permit_type") ?? "");
	if (!VALID_PERMITS.includes(permit as (typeof VALID_PERMITS)[number])) {
		return { success: false, error: "Ungültiger Bewilligungstyp." };
	}

	const startDate = String(formData.get("start_date") ?? "");
	const endDate = String(formData.get("end_date") ?? "");
	const hourlyRate = parseFloat(String(formData.get("hourly_rate") ?? "0"));
	const employmentPct = parseInt(String(formData.get("employment_percentage") ?? "100"), 10);
	const cautionAmount = parseFloat(String(formData.get("caution_amount") ?? "0"));

	if (!startDate) {
		return { success: false, error: "Bitte ein Einsatzdatum angeben." };
	}
	if (isNaN(hourlyRate) || hourlyRate < 0) {
		return { success: false, error: "Bitte einen gültigen Stundenlohn angeben." };
	}

	const input: TempStaffingInput = {
		assignment: {
			start_date: startDate,
			end_date: endDate || undefined,
			canton: canton as TempStaffingInput["assignment"]["canton"],
			industry: String(formData.get("industry") ?? "Sonstige"),
			gav_code: String(formData.get("gav_code") ?? "") || undefined,
		},
		worker: {
			nationality: String(formData.get("nationality") ?? "CH").toUpperCase(),
			permit_type: permit as TempStaffingInput["worker"]["permit_type"],
			hourly_rate: hourlyRate,
			employment_percentage: employmentPct,
		},
		agency: {
			has_seco_license: formData.get("has_seco_license") === "on",
			license_type: String(formData.get("license_type") ?? "ch_only") as "ch_only" | "ch_and_abroad",
			has_caution: formData.get("has_caution") === "on",
			caution_amount: cautionAmount > 0 ? cautionAmount : undefined,
		},
	};

	try {
		const data = validateTempStaffing(input);
		return { success: true, data };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Validierungsfehler",
		};
	}
}
