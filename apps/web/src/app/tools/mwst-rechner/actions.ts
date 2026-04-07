"use server";

import { vatCalculationInputSchema, type VatCalculationInput, type VatCalculationResult, type VatRateType } from "@rappen/shared";
import { calculateVat } from "@rappen/swiss-data";

export interface VatActionResult {
	success: boolean;
	data?: VatCalculationResult;
	error?: string;
}

export async function calculateVatAction(formData: FormData): Promise<VatActionResult> {
	const transactionCount = parseInt(String(formData.get("transaction_count") ?? "1"), 10) || 1;
	const transactions: VatCalculationInput["transactions"] = [];

	for (let i = 0; i < transactionCount; i++) {
		const description = String(formData.get(`tx_description_${i}`) ?? "").trim();
		const amount = parseFloat(String(formData.get(`tx_amount_${i}`) ?? "0"));
		const rateType = String(formData.get(`tx_rate_${i}`) ?? "normal") as VatRateType;
		const isExport = formData.get(`tx_export_${i}`) === "on";
		const isImport = formData.get(`tx_import_${i}`) === "on";

		if (description && amount > 0) {
			transactions.push({
				description,
				amount,
				rate_type: rateType,
				is_export: isExport || undefined,
				is_import: isImport || undefined,
			});
		}
	}

	if (transactions.length === 0) {
		return { success: false, error: "Bitte mindestens eine Transaktion eingeben." };
	}

	const rawInput: VatCalculationInput = {
		transactions,
		method: String(formData.get("method") ?? "effective") as "effective" | "saldo" | "pauschal",
		saldo_rate_code: String(formData.get("saldo_rate_code") ?? "") || undefined,
		period: {
			from: String(formData.get("period_from") ?? "2026-01-01"),
			to: String(formData.get("period_to") ?? "2026-03-31"),
		},
		include_reverse_charge: formData.get("include_reverse_charge") === "on",
	};

	const parsed = vatCalculationInputSchema.safeParse(rawInput);
	if (!parsed.success) {
		return {
			success: false,
			error: "Bitte überprüfen Sie die Eingaben.",
		};
	}

	try {
		const result = calculateVat(parsed.data);
		return { success: true, data: result };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Berechnungsfehler",
		};
	}
}
