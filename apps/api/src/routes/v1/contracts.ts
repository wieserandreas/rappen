import { Hono } from "hono";
import type { ApiResponse, ContractResult } from "@rappen/shared";
import { validateContractInput, prepareContract, CONTRACT_TYPE_NAMES } from "@rappen/swiss-data";

export const contractRoutes = new Hono();

contractRoutes.get("/types", async (c) => {
	const types = Object.entries(CONTRACT_TYPE_NAMES).map(([type, names]) => ({
		type,
		...names,
	}));

	return c.json({ success: true, data: types });
});

contractRoutes.post("/generate", async (c) => {
	const input = await c.req.json();

	try {
		const validation = validateContractInput(input);
		if (!validation.valid) {
			return c.json({
				success: false,
				error: { code: "VALIDATION_ERROR", message: validation.warnings.join("; ") },
			}, 400);
		}

		const prepared = prepareContract(input);

		// TODO: Actual Handlebars template rendering + DOCX/PDF generation
		// For now, return the prepared template data
		const response: ApiResponse<ContractResult> = {
			success: true,
			data: {
				docx_base64: "", // TODO: Render with Handlebars + docx library
				pdf_base64: "", // TODO: Convert DOCX to PDF
				warnings: validation.warnings,
				required_clauses_present: true,
				disclaimer: prepared.disclaimer,
			},
			meta: {
				calculation_date: new Date().toISOString(),
				legal_basis: prepared.legal_basis,
				year: new Date().getFullYear(),
			},
		};

		return c.json(response, 200);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Generierungsfehler";
		return c.json({ success: false, error: { code: "GENERATION_ERROR", message } }, 400);
	}
});
