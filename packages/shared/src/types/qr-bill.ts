export interface QrBillInput {
	creditor: QrBillAddress;
	debtor?: QrBillAddress;
	amount?: number;
	currency: "CHF" | "EUR";
	reference_type: "QRR" | "SCOR" | "NON";
	reference?: string;
	iban: string;
	additional_info?: string;
	language: "de" | "fr" | "it" | "en";
}

export interface QrBillAddress {
	name: string;
	street: string;
	building_number?: string;
	postal_code: string;
	city: string;
	country: string;
}

export interface QrBillGenerateResult {
	pdf_base64: string;
	qr_data: string;
	validation: QrBillValidation;
}

export interface QrBillValidation {
	valid: boolean;
	errors: QrBillValidationError[];
	warnings: QrBillValidationWarning[];
}

export interface QrBillValidationError {
	field: string;
	code: string;
	message: string;
}

export interface QrBillValidationWarning {
	field: string;
	code: string;
	message: string;
}

export interface QrBillParseResult {
	creditor: QrBillAddress;
	debtor?: QrBillAddress;
	amount?: number;
	currency: "CHF" | "EUR";
	reference_type: "QRR" | "SCOR" | "NON";
	reference?: string;
	iban: string;
	additional_info?: string;
}
