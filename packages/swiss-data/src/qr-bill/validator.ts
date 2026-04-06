import type { QrBillInput, QrBillValidation, QrBillValidationError, QrBillValidationWarning } from "@rappen/shared";
import { isValidSwissIban, isQrIban } from "@rappen/shared";

/**
 * Validate a QR-Bill input according to SIX QR-Bill Standard v2.3.
 * Returns all errors and warnings.
 */
export function validateQrBill(input: QrBillInput): QrBillValidation {
	const errors: QrBillValidationError[] = [];
	const warnings: QrBillValidationWarning[] = [];

	// ── IBAN Validation ──
	if (!isValidSwissIban(input.iban)) {
		errors.push({
			field: "iban",
			code: "INVALID_IBAN",
			message: "Ungültige Schweizer IBAN. Format: CH + 2 Prüfziffern + 17 Zeichen.",
		});
	}

	// ── Reference Type vs IBAN ──
	if (input.reference_type === "QRR") {
		if (!isQrIban(input.iban)) {
			errors.push({
				field: "iban",
				code: "QRR_REQUIRES_QR_IBAN",
				message: "QR-Referenz (QRR) erfordert eine QR-IBAN (IID 30000-31999).",
			});
		}
		if (!input.reference) {
			errors.push({
				field: "reference",
				code: "QRR_REQUIRES_REFERENCE",
				message: "QR-Referenz (QRR) erfordert eine 27-stellige Referenznummer.",
			});
		} else if (!isValidQrReference(input.reference)) {
			errors.push({
				field: "reference",
				code: "INVALID_QR_REFERENCE",
				message: "Ungültige QR-Referenz. Muss 27 Ziffern sein mit gültiger Prüfziffer (Modulo 10 rekursiv).",
			});
		}
	} else if (input.reference_type === "SCOR") {
		if (isQrIban(input.iban)) {
			errors.push({
				field: "iban",
				code: "SCOR_REQUIRES_REGULAR_IBAN",
				message: "Creditor Reference (SCOR) erfordert eine reguläre IBAN (keine QR-IBAN).",
			});
		}
		if (!input.reference) {
			errors.push({
				field: "reference",
				code: "SCOR_REQUIRES_REFERENCE",
				message: "Creditor Reference (SCOR) erfordert eine ISO 11649 Referenz.",
			});
		} else if (!isValidScorReference(input.reference)) {
			errors.push({
				field: "reference",
				code: "INVALID_SCOR_REFERENCE",
				message: "Ungültige Creditor Reference (SCOR). Muss mit RF beginnen + max 25 Zeichen.",
			});
		}
	} else if (input.reference_type === "NON") {
		if (isQrIban(input.iban)) {
			errors.push({
				field: "iban",
				code: "NON_REQUIRES_REGULAR_IBAN",
				message: "Ohne Referenz (NON) erfordert eine reguläre IBAN (keine QR-IBAN).",
			});
		}
		if (input.reference) {
			warnings.push({
				field: "reference",
				code: "NON_IGNORES_REFERENCE",
				message: "Referenz wird bei Typ NON ignoriert.",
			});
		}
	}

	// ── Creditor Address (mandatory) ──
	if (!input.creditor.name || input.creditor.name.length === 0) {
		errors.push({ field: "creditor.name", code: "MISSING_CREDITOR_NAME", message: "Name des Zahlungsempfängers ist erforderlich." });
	}
	if (input.creditor.name && input.creditor.name.length > 70) {
		errors.push({ field: "creditor.name", code: "CREDITOR_NAME_TOO_LONG", message: "Name max. 70 Zeichen." });
	}

	// Structured address required from September 2026
	if (!input.creditor.street) {
		warnings.push({
			field: "creditor.street",
			code: "STRUCTURED_ADDRESS_RECOMMENDED",
			message: "Strukturierte Adresse (Strasse + Hausnummer) ab September 2026 Pflicht.",
		});
	}

	// ── Amount ──
	if (input.amount != null) {
		if (input.amount <= 0) {
			errors.push({ field: "amount", code: "INVALID_AMOUNT", message: "Betrag muss grösser als 0 sein." });
		}
		if (input.amount > 999999999.99) {
			errors.push({ field: "amount", code: "AMOUNT_TOO_LARGE", message: "Betrag max. 999'999'999.99." });
		}
	}

	// ── Currency ──
	if (input.currency !== "CHF" && input.currency !== "EUR") {
		errors.push({ field: "currency", code: "INVALID_CURRENCY", message: "Nur CHF oder EUR erlaubt." });
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate QR-Reference (27 digits with Modulo 10 recursive check digit).
 */
function isValidQrReference(ref: string): boolean {
	const cleaned = ref.replace(/\s/g, "");
	if (!/^\d{27}$/.test(cleaned)) return false;

	// Modulo 10 recursive check
	const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
	let carry = 0;
	for (let i = 0; i < 26; i++) {
		carry = table[(carry + parseInt(cleaned[i], 10)) % 10];
	}
	const checkDigit = (10 - carry) % 10;
	return checkDigit === parseInt(cleaned[26], 10);
}

/**
 * Validate SCOR (Creditor Reference ISO 11649).
 * Format: RF + 2 check digits + max 21 alphanumeric characters.
 */
function isValidScorReference(ref: string): boolean {
	const cleaned = ref.replace(/\s/g, "").toUpperCase();
	return /^RF\d{2}[A-Z0-9]{1,21}$/.test(cleaned);
}
