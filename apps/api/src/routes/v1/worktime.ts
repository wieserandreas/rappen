import { Hono } from "hono";
import type { ApiResponse, WorktimeValidationResult } from "@rappen/shared";
import { validateWorktime } from "@rappen/swiss-data";

export const worktimeRoutes = new Hono();

worktimeRoutes.post("/validate", async (c) => {
	const input = await c.req.json();

	try {
		const result = validateWorktime(input);

		const response: ApiResponse<WorktimeValidationResult> = {
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
		const message = err instanceof Error ? err.message : "Validierungsfehler";
		return c.json({ success: false, error: { code: "VALIDATION_ERROR", message } }, 400);
	}
});
