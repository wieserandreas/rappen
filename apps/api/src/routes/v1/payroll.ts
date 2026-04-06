import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { payrollInputSchema } from "@rappen/shared";
import type { ApiResponse, PayrollResult } from "@rappen/shared";

export const payrollRoutes = new Hono();

payrollRoutes.post(
	"/calculate",
	zValidator("json", payrollInputSchema),
	async (c) => {
		const input = c.req.valid("json");

		// TODO: Implement full payroll calculation engine
		// This is the stub – Phase 1 will implement the complete logic
		const response: ApiResponse<PayrollResult> = {
			success: false,
			error: {
				code: "NOT_IMPLEMENTED",
				message: "Lohnberechnung wird in Phase 1 implementiert.",
			},
		};

		return c.json(response, 501);
	},
);
