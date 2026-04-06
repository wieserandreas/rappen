import { describe, it, expect } from "vitest";
import { validateQrBill, generateQrBillPayload, parseQrBillPayload } from "@rappen/swiss-data";
import { isValidSwissIban, isQrIban } from "@rappen/shared";
import type { QrBillInput } from "@rappen/shared";

// Valid QR-IBAN for testing (QR-IID range 30000-31999)
const VALID_QR_IBAN = "CH4431999123000889012";
// Valid regular IBAN for testing
const VALID_IBAN = "CH9300762011623852957";
// Valid QR-Reference (27 digits with valid Modulo 10 check)
const VALID_QR_REF = "210000000003139471430009017";

function makeQrBillInput(overrides: Partial<QrBillInput> = {}): QrBillInput {
	return {
		creditor: {
			name: "Rappen AG",
			street: "Bahnhofstrasse",
			building_number: "10",
			postal_code: "8001",
			city: "Zürich",
			country: "CH",
		},
		amount: 1500.50,
		currency: "CHF",
		reference_type: "QRR",
		reference: VALID_QR_REF,
		iban: VALID_QR_IBAN,
		language: "de",
		...overrides,
	};
}

// ════════════════════════════════════════════════════════════
// IBAN Utilities
// ════════════════════════════════════════════════════════════
describe("QR-Bill – IBAN Validation", () => {
	it("should validate correct Swiss IBAN", () => {
		expect(isValidSwissIban("CH9300762011623852957")).toBe(true);
	});

	it("should reject non-Swiss IBAN", () => {
		expect(isValidSwissIban("DE89370400440532013000")).toBe(false);
	});

	it("should reject invalid checksum", () => {
		expect(isValidSwissIban("CH0000762011623852957")).toBe(false);
	});

	it("should detect QR-IBAN (IID 30000-31999)", () => {
		expect(isQrIban(VALID_QR_IBAN)).toBe(true);
		expect(isQrIban(VALID_IBAN)).toBe(false);
	});
});

// ════════════════════════════════════════════════════════════
// Validation
// ════════════════════════════════════════════════════════════
describe("QR-Bill – Validation", () => {
	it("should validate a correct QRR bill", () => {
		const result = validateQrBill(makeQrBillInput());
		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	it("should reject QRR with regular IBAN", () => {
		const result = validateQrBill(makeQrBillInput({
			iban: VALID_IBAN,
			reference_type: "QRR",
		}));
		expect(result.valid).toBe(false);
		expect(result.errors.some(e => e.code === "QRR_REQUIRES_QR_IBAN")).toBe(true);
	});

	it("should reject QRR without reference", () => {
		const result = validateQrBill(makeQrBillInput({
			reference: undefined,
		}));
		expect(result.valid).toBe(false);
		expect(result.errors.some(e => e.code === "QRR_REQUIRES_REFERENCE")).toBe(true);
	});

	it("should reject SCOR with QR-IBAN", () => {
		const result = validateQrBill(makeQrBillInput({
			reference_type: "SCOR",
			reference: "RF18539007547034",
			iban: VALID_QR_IBAN,
		}));
		expect(result.valid).toBe(false);
		expect(result.errors.some(e => e.code === "SCOR_REQUIRES_REGULAR_IBAN")).toBe(true);
	});

	it("should validate SCOR with regular IBAN", () => {
		const result = validateQrBill(makeQrBillInput({
			reference_type: "SCOR",
			reference: "RF18539007547034",
			iban: VALID_IBAN,
		}));
		expect(result.valid).toBe(true);
	});

	it("should validate NON reference type", () => {
		const result = validateQrBill(makeQrBillInput({
			reference_type: "NON",
			reference: undefined,
			iban: VALID_IBAN,
		}));
		expect(result.valid).toBe(true);
	});

	it("should warn when NON has a reference", () => {
		const result = validateQrBill(makeQrBillInput({
			reference_type: "NON",
			reference: "some-ref",
			iban: VALID_IBAN,
		}));
		expect(result.valid).toBe(true);
		expect(result.warnings.some(w => w.code === "NON_IGNORES_REFERENCE")).toBe(true);
	});

	it("should reject invalid amount", () => {
		const result = validateQrBill(makeQrBillInput({ amount: -100 }));
		expect(result.valid).toBe(false);
		expect(result.errors.some(e => e.code === "INVALID_AMOUNT")).toBe(true);
	});

	it("should accept bill without amount (open amount)", () => {
		const result = validateQrBill(makeQrBillInput({ amount: undefined }));
		expect(result.valid).toBe(true);
	});

	it("should reject missing creditor name", () => {
		const result = validateQrBill(makeQrBillInput({
			creditor: { ...makeQrBillInput().creditor, name: "" },
		}));
		expect(result.valid).toBe(false);
		expect(result.errors.some(e => e.code === "MISSING_CREDITOR_NAME")).toBe(true);
	});
});

// ════════════════════════════════════════════════════════════
// QR Payload Generation & Parsing
// ════════════════════════════════════════════════════════════
describe("QR-Bill – Payload Generation", () => {
	it("should generate valid SPC payload", () => {
		const payload = generateQrBillPayload(makeQrBillInput());
		const lines = payload.split("\n");

		expect(lines[0]).toBe("SPC");
		expect(lines[1]).toBe("0200");
		expect(lines[2]).toBe("1");
		expect(lines[3]).toBe(VALID_QR_IBAN);
		expect(lines[4]).toBe("S"); // Structured address
		expect(lines[5]).toBe("Rappen AG");
		expect(lines[18]).toBe("1500.50");
		expect(lines[19]).toBe("CHF");
		expect(lines[27]).toBe("QRR");
		expect(lines[28]).toBe(VALID_QR_REF);
		expect(lines[30]).toBe("EPD");
	});

	it("should handle bill without amount", () => {
		const payload = generateQrBillPayload(makeQrBillInput({ amount: undefined }));
		const lines = payload.split("\n");
		expect(lines[18]).toBe("");
	});

	it("should handle bill without debtor", () => {
		const payload = generateQrBillPayload(makeQrBillInput({ debtor: undefined }));
		const lines = payload.split("\n");
		expect(lines[20]).toBe(""); // Empty debtor address type
	});
});

describe("QR-Bill – Payload Parsing (Roundtrip)", () => {
	it("should parse generated payload back to input", () => {
		const input = makeQrBillInput();
		const payload = generateQrBillPayload(input);
		const parsed = parseQrBillPayload(payload);

		expect(parsed).not.toBeNull();
		expect(parsed!.iban).toBe(VALID_QR_IBAN);
		expect(parsed!.creditor.name).toBe("Rappen AG");
		expect(parsed!.amount).toBeCloseTo(1500.50);
		expect(parsed!.currency).toBe("CHF");
		expect(parsed!.reference_type).toBe("QRR");
		expect(parsed!.reference).toBe(VALID_QR_REF);
	});

	it("should return null for invalid payload", () => {
		expect(parseQrBillPayload("invalid data")).toBeNull();
	});
});
