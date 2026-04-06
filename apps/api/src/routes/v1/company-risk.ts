import { Hono } from "hono";
import type { ApiResponse, CompanyRiskResult } from "@rappen/shared";
import { calculateRiskScore } from "@rappen/swiss-data";

export const companyRiskRoutes = new Hono();

companyRiskRoutes.post("/score", async (c) => {
	const input = await c.req.json();

	try {
		const result = calculateRiskScore(input);
		const response: ApiResponse<CompanyRiskResult> = {
			success: true,
			data: result,
			meta: {
				calculation_date: new Date().toISOString(),
				legal_basis: ["ZEFIX REST API", "SHAB Publikationen", "UID-Register"],
				year: new Date().getFullYear(),
			},
		};
		return c.json(response, 200);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Bewertungsfehler";
		return c.json({ success: false, error: { code: "SCORING_ERROR", message } }, 400);
	}
});
