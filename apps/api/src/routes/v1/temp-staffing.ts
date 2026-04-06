import { Hono } from "hono";
import type { ApiResponse, TempStaffingResult } from "@rappen/shared";
import { validateTempStaffing } from "@rappen/swiss-data";

export const tempStaffingRoutes = new Hono();

tempStaffingRoutes.post("/validate", async (c) => {
	const input = await c.req.json();

	try {
		const result = validateTempStaffing(input);
		const response: ApiResponse<TempStaffingResult> = {
			success: true,
			data: result,
			meta: {
				calculation_date: new Date().toISOString(),
				legal_basis: result.legal_basis,
				canton: input.assignment?.canton,
				year: new Date().getFullYear(),
			},
		};
		return c.json(response, 200);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Validierungsfehler";
		return c.json({ success: false, error: { code: "VALIDATION_ERROR", message } }, 400);
	}
});
