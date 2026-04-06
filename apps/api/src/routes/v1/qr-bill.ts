import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { qrBillInputSchema } from "@rappen/shared";
import type { ApiResponse, QrBillGenerateResult, QrBillValidation, QrBillParseResult } from "@rappen/shared";
import { validateQrBill, generateQrBillPayload, parseQrBillPayload } from "@rappen/swiss-data";

export const qrBillRoutes = new Hono();

qrBillRoutes.post(
	"/generate",
	zValidator("json", qrBillInputSchema),
	async (c) => {
		const input = c.req.valid("json");

		// Validate first
		const validation = validateQrBill(input);
		if (!validation.valid) {
			const response: ApiResponse<QrBillGenerateResult> = {
				success: false,
				error: {
					code: "VALIDATION_ERROR",
					message: "QR-Rechnung Validierung fehlgeschlagen.",
					details: Object.fromEntries(
						validation.errors.map((e) => [e.field, e.message]),
					),
				},
			};
			return c.json(response, 400);
		}

		// Generate QR payload
		const qrData = generateQrBillPayload(input);

		// PDF generation via swissqrbill happens here
		// For now, return the QR data string (PDF will be added with swissqrbill integration)
		const response: ApiResponse<QrBillGenerateResult> = {
			success: true,
			data: {
				pdf_base64: "", // TODO: Generate PDF with swissqrbill
				qr_data: qrData,
				validation,
			},
			meta: {
				calculation_date: new Date().toISOString(),
				legal_basis: ["Swiss QR-Bill Standard v2.3 (SIX Group)"],
				year: new Date().getFullYear(),
			},
		};

		return c.json(response, 200);
	},
);

qrBillRoutes.post("/validate", zValidator("json", qrBillInputSchema), async (c) => {
	const input = c.req.valid("json");
	const validation = validateQrBill(input);

	const response: ApiResponse<QrBillValidation> = {
		success: true,
		data: validation,
		meta: {
			calculation_date: new Date().toISOString(),
			legal_basis: ["Swiss QR-Bill Standard v2.3 (SIX Group)"],
			year: new Date().getFullYear(),
		},
	};

	return c.json(response, 200);
});

qrBillRoutes.post("/parse", async (c) => {
	const body = await c.req.json<{ payload: string }>();

	if (!body.payload) {
		const response: ApiResponse<never> = {
			success: false,
			error: { code: "MISSING_PAYLOAD", message: "QR-Code Payload fehlt." },
		};
		return c.json(response, 400);
	}

	const parsed = parseQrBillPayload(body.payload);
	if (!parsed) {
		const response: ApiResponse<never> = {
			success: false,
			error: { code: "PARSE_ERROR", message: "QR-Code konnte nicht geparst werden. Ungültiges Format." },
		};
		return c.json(response, 400);
	}

	const response: ApiResponse<QrBillParseResult> = {
		success: true,
		data: {
			creditor: parsed.creditor,
			debtor: parsed.debtor,
			amount: parsed.amount,
			currency: parsed.currency,
			reference_type: parsed.reference_type,
			reference: parsed.reference,
			iban: parsed.iban,
			additional_info: parsed.additional_info,
		},
	};

	return c.json(response, 200);
});
