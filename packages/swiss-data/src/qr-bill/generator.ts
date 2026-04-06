import type { QrBillInput, QrBillGenerateResult } from "@rappen/shared";
import { validateQrBill } from "./validator.js";

/**
 * Generate a QR-Bill payload string according to SIX QR-Bill Standard v2.3.
 *
 * The QR-Bill payload is a structured text that gets encoded into a Swiss QR Code.
 * PDF generation uses the swissqrbill library in the API layer.
 */
export function generateQrBillPayload(input: QrBillInput): string {
	const lines: string[] = [];

	// Header
	lines.push("SPC"); // Swiss Payments Code
	lines.push("0200"); // Version
	lines.push("1"); // Coding Type (UTF-8)

	// Creditor Account
	lines.push(input.iban.replace(/\s/g, "").toUpperCase());

	// Creditor (structured address = S)
	lines.push("S"); // Address Type
	lines.push(input.creditor.name);
	lines.push(input.creditor.street || "");
	lines.push(input.creditor.building_number || "");
	lines.push(input.creditor.postal_code);
	lines.push(input.creditor.city);
	lines.push(input.creditor.country.toUpperCase());

	// Ultimate Creditor (not used, 7 empty lines)
	lines.push(""); // Address Type
	lines.push(""); // Name
	lines.push(""); // Street
	lines.push(""); // Building Number
	lines.push(""); // Postal Code
	lines.push(""); // City
	lines.push(""); // Country

	// Payment Amount
	lines.push(input.amount != null ? input.amount.toFixed(2) : "");
	lines.push(input.currency);

	// Ultimate Debtor
	if (input.debtor) {
		lines.push("S"); // Address Type
		lines.push(input.debtor.name);
		lines.push(input.debtor.street || "");
		lines.push(input.debtor.building_number || "");
		lines.push(input.debtor.postal_code);
		lines.push(input.debtor.city);
		lines.push(input.debtor.country.toUpperCase());
	} else {
		lines.push(""); // Address Type
		lines.push(""); // Name
		lines.push(""); // Street
		lines.push(""); // Building Number
		lines.push(""); // Postal Code
		lines.push(""); // City
		lines.push(""); // Country
	}

	// Reference
	lines.push(input.reference_type);
	lines.push(input.reference?.replace(/\s/g, "") || "");

	// Additional Information
	lines.push(input.additional_info || "");

	// Trailer
	lines.push("EPD"); // End Payment Data

	return lines.join("\n");
}

/**
 * Parse a QR-Bill payload string back into structured data.
 */
export function parseQrBillPayload(payload: string): QrBillInput | null {
	const lines = payload.split("\n");

	if (lines.length < 31 || lines[0] !== "SPC") {
		return null;
	}

	// SPC layout: 0=SPC, 1=Version, 2=Coding, 3=IBAN,
	// 4-10=Creditor(7), 11-17=UltCreditor(7), 18=Amount, 19=Currency,
	// 20-26=Debtor(7), 27=RefType, 28=Ref, 29=AddInfo, 30=EPD
	const refType = lines[27] as "QRR" | "SCOR" | "NON";

	return {
		iban: lines[3],
		creditor: {
			name: lines[5],
			street: lines[6],
			building_number: lines[7] || undefined,
			postal_code: lines[8],
			city: lines[9],
			country: lines[10],
		},
		amount: lines[18] ? parseFloat(lines[18]) : undefined,
		currency: lines[19] as "CHF" | "EUR",
		debtor: lines[20]
			? {
					name: lines[21],
					street: lines[22],
					building_number: lines[23] || undefined,
					postal_code: lines[24],
					city: lines[25],
					country: lines[26],
				}
			: undefined,
		reference_type: refType,
		reference: lines[28] || undefined,
		additional_info: lines[29] || undefined,
		language: "de",
	};
}
