import { Hono } from "hono";
import type { ApiResponse, CrossBorderResult } from "@rappen/shared";
import { calculateCrossBorder } from "@rappen/swiss-data";

export const crossBorderRoutes = new Hono();

crossBorderRoutes.post("/calculate", async (c) => {
	const input = await c.req.json();

	try {
		const result = calculateCrossBorder(input);
		const response: ApiResponse<CrossBorderResult> = {
			success: true,
			data: result,
			meta: {
				calculation_date: new Date().toISOString(),
				legal_basis: result.legal_basis,
				canton: input.work_canton,
				year: new Date().getFullYear(),
			},
		};
		return c.json(response, 200);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Berechnungsfehler";
		return c.json({ success: false, error: { code: "CALCULATION_ERROR", message } }, 400);
	}
});
