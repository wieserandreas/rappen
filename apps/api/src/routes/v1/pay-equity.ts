import { Hono } from "hono";
import type { ApiResponse, PayEquityResult } from "@rappen/shared";
import { analyzePayEquity } from "@rappen/swiss-data";

export const payEquityRoutes = new Hono();

payEquityRoutes.post("/analyze", async (c) => {
	const input = await c.req.json();

	try {
		const result = analyzePayEquity(input);

		const response: ApiResponse<PayEquityResult> = {
			success: true,
			data: result,
			meta: {
				calculation_date: new Date().toISOString(),
				legal_basis: result.legal_basis,
				year: new Date().getFullYear(),
			},
		};

		return c.json(response, 200);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Analysefehler";
		return c.json({ success: false, error: { code: "ANALYSIS_ERROR", message } }, 400);
	}
});
