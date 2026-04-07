"use server";

import { payrollInputSchema, type PayrollInput, type PayrollResult } from "@rappen/shared";
import { calculatePayroll } from "@rappen/swiss-data";

export interface PayrollActionResult {
	success: boolean;
	data?: PayrollResult;
	error?: string;
	fieldErrors?: Record<string, string>;
}

export async function calculatePayrollAction(formData: FormData): Promise<PayrollActionResult> {
	const childrenCount = parseInt(String(formData.get("children") ?? "0"), 10) || 0;
	const childrenAges: number[] = [];
	for (let i = 0; i < childrenCount; i++) {
		const age = parseInt(String(formData.get(`child_age_${i}`) ?? "0"), 10);
		if (!isNaN(age)) childrenAges.push(age);
	}

	const rawInput: Partial<PayrollInput> = {
		canton: String(formData.get("canton") ?? "ZH") as PayrollInput["canton"],
		gross_monthly: parseFloat(String(formData.get("gross_monthly") ?? "0")),
		birth_year: parseInt(String(formData.get("birth_year") ?? "1990"), 10),
		marital_status: String(formData.get("marital_status") ?? "single") as PayrollInput["marital_status"],
		children: childrenCount,
		children_ages: childrenAges.length > 0 ? childrenAges : undefined,
		church: String(formData.get("church") ?? "keine") as PayrollInput["church"],
		withholding_tax: formData.get("withholding_tax") === "on",
		bvg_plan: String(formData.get("bvg_plan") ?? "minimum") as PayrollInput["bvg_plan"],
		uvg_nbu_rate: parseFloat(String(formData.get("uvg_nbu_rate") ?? "1.5")),
		employment_percentage: parseFloat(String(formData.get("employment_percentage") ?? "100")),
		thirteenth_salary: formData.get("thirteenth_salary") === "on",
		bonus: formData.get("bonus") ? parseFloat(String(formData.get("bonus"))) : undefined,
	};

	const parsed = payrollInputSchema.safeParse(rawInput);
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			fieldErrors[issue.path.join(".")] = issue.message;
		}
		return {
			success: false,
			error: "Bitte überprüfen Sie die Eingaben.",
			fieldErrors,
		};
	}

	try {
		const result = calculatePayroll(parsed.data);
		return { success: true, data: result };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Berechnungsfehler",
		};
	}
}
