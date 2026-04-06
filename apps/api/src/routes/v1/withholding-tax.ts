import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { withholdingTaxInputSchema } from "@rappen/shared";
import type { ApiResponse, WithholdingTaxResult } from "@rappen/shared";
import { calculateWithholdingTax } from "@rappen/swiss-data";

export const withholdingTaxRoutes = new Hono();

withholdingTaxRoutes.post(
	"/calculate",
	zValidator("json", withholdingTaxInputSchema),
	async (c) => {
		const input = c.req.valid("json");

		try {
			const result = calculateWithholdingTax(input);

			const response: ApiResponse<WithholdingTaxResult> = {
				success: true,
				data: result,
				meta: {
					calculation_date: new Date().toISOString(),
					legal_basis: ["DBG Art. 83-86", `StG ${input.canton}`],
					canton: input.canton,
					year: input.year,
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
