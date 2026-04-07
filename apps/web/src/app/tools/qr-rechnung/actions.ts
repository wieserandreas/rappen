"use server";

import { qrBillInputSchema, type QrBillInput, type QrBillValidation } from "@rappen/shared";
import { validateQrBill, generateQrBillPayload } from "@rappen/swiss-data";

export interface QrBillActionResult {
	success: boolean;
	validation?: QrBillValidation;
	qrPayload?: string;
	error?: string;
	fieldErrors?: Record<string, string>;
}

/**
 * Validate and prepare a QR-Bill from form input.
 * Returns validation results and QR payload if valid.
 */
export async function generateQrBillAction(formData: FormData): Promise<QrBillActionResult> {
	// Build input from form data
	const rawInput: Partial<QrBillInput> = {
		creditor: {
			name: String(formData.get("creditor_name") ?? "").trim(),
			street: String(formData.get("creditor_street") ?? "").trim(),
			building_number: String(formData.get("creditor_building") ?? "").trim() || undefined,
			postal_code: String(formData.get("creditor_postal") ?? "").trim(),
			city: String(formData.get("creditor_city") ?? "").trim(),
			country: String(formData.get("creditor_country") ?? "CH").trim().toUpperCase(),
		},
		debtor: formData.get("debtor_name")
			? {
					name: String(formData.get("debtor_name") ?? "").trim(),
					street: String(formData.get("debtor_street") ?? "").trim(),
					building_number: String(formData.get("debtor_building") ?? "").trim() || undefined,
					postal_code: String(formData.get("debtor_postal") ?? "").trim(),
					city: String(formData.get("debtor_city") ?? "").trim(),
					country: String(formData.get("debtor_country") ?? "CH").trim().toUpperCase(),
				}
			: undefined,
		amount: formData.get("amount") ? parseFloat(String(formData.get("amount"))) : undefined,
		currency: (String(formData.get("currency") ?? "CHF") as "CHF" | "EUR"),
		reference_type: (String(formData.get("reference_type") ?? "NON") as "QRR" | "SCOR" | "NON"),
		reference: String(formData.get("reference") ?? "").trim() || undefined,
		iban: String(formData.get("iban") ?? "").replace(/\s/g, "").toUpperCase(),
		additional_info: String(formData.get("additional_info") ?? "").trim() || undefined,
		language: "de",
	};

	// Zod validation
	const parsed = qrBillInputSchema.safeParse(rawInput);
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			const path = issue.path.join(".");
			fieldErrors[path] = issue.message;
		}
		return {
			success: false,
			error: "Bitte überprüfen Sie die Eingaben.",
			fieldErrors,
		};
	}

	// Business validation
	const validation = validateQrBill(parsed.data);

	if (!validation.valid) {
		const fieldErrors: Record<string, string> = {};
		for (const err of validation.errors) {
			fieldErrors[err.field] = err.message;
		}
		return {
			success: false,
			validation,
			error: "Die QR-Rechnung enthält Fehler.",
			fieldErrors,
		};
	}

	// Generate payload
	const qrPayload = generateQrBillPayload(parsed.data);

	return {
		success: true,
		validation,
		qrPayload,
	};
}
