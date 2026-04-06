import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { vatCalculationInputSchema } from "@rappen/shared";
import type { ApiResponse, VatCalculationResult } from "@rappen/shared";
import { calculateVat } from "@rappen/swiss-data";

export const vatRoutes = new Hono();

vatRoutes.post(
	"/calculate",
	zValidator("json", vatCalculationInputSchema),
	async (c) => {
		const input = c.req.valid("json");

		try {
			const result = calculateVat(input);

			const response: ApiResponse<VatCalculationResult> = {
				success: true,
				data: result,
				meta: {
					calculation_date: new Date().toISOString(),
					legal_basis: result.legal_basis,
					year: 2026,
				},
			};

			return c.json(response, 200);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Berechnungsfehler";
			const response: ApiResponse<never> = {
				success: false,
				error: {
					code: "CALCULATION_ERROR",
					message,
				},
			};
			return c.json(response, 400);
		}
	},
);
