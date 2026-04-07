"use server";

import type { PayEquityInput, PayEquityResult, PayEquityEmployee } from "@rappen/shared";
import { analyzePayEquity } from "@rappen/swiss-data";

export interface PayEquityActionResult {
	success: boolean;
	data?: PayEquityResult;
	parsedCount?: number;
	error?: string;
}

/**
 * Parse CSV employee data.
 * Expected columns (semicolon or comma separated):
 * gender;salary_monthly;education_level;experience_years;service_years;skill_level;position;employment_percent
 *
 * Header row is detected and skipped.
 */
function parseCsvEmployees(csv: string): { employees: PayEquityEmployee[]; errors: string[] } {
	const errors: string[] = [];
	const employees: PayEquityEmployee[] = [];

	const lines = csv
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter((l) => l.length > 0);

	if (lines.length === 0) {
		return { employees, errors: ["Keine Daten gefunden."] };
	}

	const separator = lines[0].includes(";") ? ";" : ",";

	// Detect header row
	const firstFields = lines[0].split(separator).map((f) => f.trim().toLowerCase());
	const hasHeader = firstFields.some((f) =>
		["gender", "geschlecht", "salary", "lohn", "education", "ausbildung"].includes(f),
	);
	const startIdx = hasHeader ? 1 : 0;

	for (let i = startIdx; i < lines.length; i++) {
		const fields = lines[i].split(separator).map((f) => f.trim());
		if (fields.length < 8) {
			errors.push(`Zeile ${i + 1}: Erwartet 8 Spalten, gefunden ${fields.length}.`);
			continue;
		}

		const genderRaw = fields[0].toUpperCase();
		const gender: "M" | "F" =
			genderRaw === "M" || genderRaw === "MAN" || genderRaw === "MÄNNLICH" || genderRaw === "MANN"
				? "M"
				: genderRaw === "F" || genderRaw === "WOMAN" || genderRaw === "WEIBLICH" || genderRaw === "FRAU"
					? "F"
					: (() => {
							errors.push(`Zeile ${i + 1}: Geschlecht muss M oder F sein (gefunden: ${fields[0]}).`);
							return "M" as const;
						})();

		const salary = parseFloat(fields[1].replace(/['\s]/g, ""));
		const education = parseInt(fields[2], 10);
		const experience = parseFloat(fields[3]);
		const service = parseFloat(fields[4]);
		const skill = parseInt(fields[5], 10);
		const position = parseInt(fields[6], 10);
		const employmentPct = parseFloat(fields[7]);

		if (
			isNaN(salary) || isNaN(education) || isNaN(experience) ||
			isNaN(service) || isNaN(skill) || isNaN(position) || isNaN(employmentPct)
		) {
			errors.push(`Zeile ${i + 1}: Ungültige Zahlenwerte.`);
			continue;
		}

		employees.push({
			id: `emp_${i}`,
			gender,
			salary_monthly: salary,
			education_level: Math.max(1, Math.min(5, education)) as 1 | 2 | 3 | 4 | 5,
			potential_experience_years: experience,
			service_years: service,
			skill_level: Math.max(1, Math.min(4, skill)) as 1 | 2 | 3 | 4,
			professional_position: Math.max(1, Math.min(5, position)) as 1 | 2 | 3 | 4 | 5,
			employment_percentage: employmentPct,
		});
	}

	return { employees, errors };
}

export async function analyzePayEquityAction(formData: FormData): Promise<PayEquityActionResult> {
	const csv = String(formData.get("csv_data") ?? "").trim();
	const companyName = String(formData.get("company_name") ?? "").trim() || "Unternehmen";

	if (!csv) {
		return { success: false, error: "Bitte CSV-Daten einfügen." };
	}

	const { employees, errors } = parseCsvEmployees(csv);

	if (errors.length > 0 && employees.length === 0) {
		return {
			success: false,
			error: `CSV-Parsing-Fehler:\n${errors.slice(0, 5).join("\n")}`,
		};
	}

	const input: PayEquityInput = {
		employees,
		company_name: companyName,
		analysis_date: new Date().toISOString().split("T")[0],
	};

	try {
		const data = analyzePayEquity(input);
		return { success: true, data, parsedCount: employees.length };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Analysefehler",
		};
	}
}
