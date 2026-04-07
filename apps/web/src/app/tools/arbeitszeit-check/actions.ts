"use server";

import type { WorktimeValidationInput, WorktimeValidationResult, WorktimeEntry } from "@rappen/shared";
import { validateWorktime } from "@rappen/swiss-data";

export interface WorktimeActionResult {
	success: boolean;
	data?: WorktimeValidationResult;
	error?: string;
}

export async function validateWorktimeAction(formData: FormData): Promise<WorktimeActionResult> {
	const entryCount = parseInt(String(formData.get("entry_count") ?? "0"), 10);
	const entries: WorktimeEntry[] = [];

	for (let i = 0; i < entryCount; i++) {
		const date = String(formData.get(`entry_date_${i}`) ?? "").trim();
		const start = String(formData.get(`entry_start_${i}`) ?? "").trim();
		const end = String(formData.get(`entry_end_${i}`) ?? "").trim();
		const breakMinutes = parseInt(String(formData.get(`entry_break_${i}`) ?? "0"), 10) || 0;

		if (date && start && end) {
			entries.push({
				date,
				start,
				end,
				break_minutes: breakMinutes,
				type: "regular",
			});
		}
	}

	if (entries.length === 0) {
		return { success: false, error: "Bitte mindestens einen Arbeitstag erfassen." };
	}

	const age = parseInt(String(formData.get("age") ?? "30"), 10);
	const industry = String(formData.get("industry") ?? "office") as WorktimeValidationInput["employee"]["industry"];

	if (isNaN(age) || age < 14 || age > 75) {
		return { success: false, error: "Bitte ein gültiges Alter zwischen 14 und 75 angeben." };
	}

	const input: WorktimeValidationInput = {
		entries,
		employee: {
			age,
			industry,
			has_night_permit: formData.get("has_night_permit") === "on",
			has_sunday_permit: formData.get("has_sunday_permit") === "on",
		},
		year: new Date().getFullYear(),
	};

	try {
		const data = validateWorktime(input);
		return { success: true, data };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Validierungsfehler",
		};
	}
}
