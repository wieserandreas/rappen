import type { ErrorHandler } from "hono";
import type { ApiResponse } from "@rappen/shared";

export const errorHandler: ErrorHandler = (err, c) => {
	console.error(`[ERROR] ${err.message}`, err.stack);

	const status = "status" in err ? (err.status as number) : 500;
	const response: ApiResponse<never> = {
		success: false,
		error: {
			code: status === 400 ? "VALIDATION_ERROR" : "INTERNAL_ERROR",
			message: status === 500 ? "Ein interner Fehler ist aufgetreten." : err.message,
		},
	};

	return c.json(response, status as 400 | 500);
};
