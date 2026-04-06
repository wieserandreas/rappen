import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { qrBillInputSchema } from "@rappen/shared";
import type { ApiResponse, QrBillGenerateResult, QrBillParseResult, QrBillValidation } from "@rappen/shared";

export const qrBillRoutes = new Hono();

qrBillRoutes.post(
	"/generate",
	zValidator("json", qrBillInputSchema),
	async (c) => {
		const input = c.req.valid("json");

		const response: ApiResponse<QrBillGenerateResult> = {
			success: false,
			error: {
				code: "NOT_IMPLEMENTED",
				message: "QR-Rechnung Generierung wird in Phase 1 implementiert.",
			},
		};

		return c.json(response, 501);
	},
);

qrBillRoutes.post("/validate", async (c) => {
	const response: ApiResponse<QrBillValidation> = {
		success: false,
		error: {
			code: "NOT_IMPLEMENTED",
			message: "QR-Rechnung Validierung wird in Phase 1 implementiert.",
		},
	};

	return c.json(response, 501);
});

qrBillRoutes.post("/parse", async (c) => {
	const response: ApiResponse<QrBillParseResult> = {
		success: false,
		error: {
			code: "NOT_IMPLEMENTED",
			message: "QR-Rechnung Parsing wird in Phase 1 implementiert.",
		},
	};

	return c.json(response, 501);
});
