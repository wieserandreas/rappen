import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { vatCalculationInputSchema } from "@rappen/shared";
import type { ApiResponse, VatCalculationResult } from "@rappen/shared";

export const vatRoutes = new Hono();

vatRoutes.post(
	"/calculate",
	zValidator("json", vatCalculationInputSchema),
	async (c) => {
		const input = c.req.valid("json");

		const response: ApiResponse<VatCalculationResult> = {
			success: false,
			error: {
				code: "NOT_IMPLEMENTED",
				message: "MWST-Berechnung wird in Phase 1 implementiert.",
			},
		};

		return c.json(response, 501);
	},
);
