"use server";

import { withholdingTaxInputSchema, type WithholdingTaxInput, type WithholdingTaxResult } from "@rappen/shared";
import { calculateWithholdingTax } from "@rappen/swiss-data";

export interface QstActionResult {
	success: boolean;
	data?: WithholdingTaxResult;
	error?: string;
	fieldErrors?: Record<string, string>;
}

export async function calculateQstAction(formData: FormData): Promise<QstActionResult> {
	const rawInput: Partial<WithholdingTaxInput> = {
		canton: String(formData.get("canton") ?? "ZH") as WithholdingTaxInput["canton"],
		year: parseInt(String(formData.get("year") ?? "2026"), 10),
		tariff_code: String(formData.get("tariff_code") ?? "A") as WithholdingTaxInput["tariff_code"],
		children: parseInt(String(formData.get("children") ?? "0"), 10),
		church: String(formData.get("church") ?? "keine") as WithholdingTaxInput["church"],
		gross_monthly: parseFloat(String(formData.get("gross_monthly") ?? "0")),
		thirteenth_salary: formData.get("thirteenth_salary") === "on",
	};

	const parsed = withholdingTaxInputSchema.safeParse(rawInput);
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			fieldErrors[issue.path.join(".")] = issue.message;
		}
		return { success: false, error: "Bitte überprüfen Sie die Eingaben.", fieldErrors };
	}

	try {
		const data = calculateWithholdingTax(parsed.data);
		return { success: true, data };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Berechnungsfehler",
		};
	}
}
