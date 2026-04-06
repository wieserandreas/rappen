import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { payrollInputSchema } from "@rappen/shared";
import type { ApiResponse, PayrollResult } from "@rappen/shared";
import { calculatePayroll } from "@rappen/swiss-data";

export const payrollRoutes = new Hono();

payrollRoutes.post(
	"/calculate",
	zValidator("json", payrollInputSchema),
	async (c) => {
		const input = c.req.valid("json");

		try {
			const result = calculatePayroll(input);

			const response: ApiResponse<PayrollResult> = {
				success: true,
				data: result,
				meta: {
					calculation_date: new Date().toISOString(),
					legal_basis: [
						"AHVG Art. 5",
						"AVIG Art. 3",
						"BVG Art. 7, 8, 16",
						"UVG Art. 91, 92",
						"FamZG",
					],
					canton: input.canton,
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
			return c.json(response, 500);
		}
	},
);
