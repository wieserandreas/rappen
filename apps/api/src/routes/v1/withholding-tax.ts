import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { withholdingTaxInputSchema } from "@rappen/shared";
import type { ApiResponse, WithholdingTaxResult } from "@rappen/shared";

export const withholdingTaxRoutes = new Hono();

withholdingTaxRoutes.post(
	"/calculate",
	zValidator("json", withholdingTaxInputSchema),
	async (c) => {
		const input = c.req.valid("json");

		const response: ApiResponse<WithholdingTaxResult> = {
			success: false,
			error: {
				code: "NOT_IMPLEMENTED",
				message: "Quellensteuerberechnung wird in Phase 1 implementiert.",
			},
		};

		return c.json(response, 501);
	},
);
