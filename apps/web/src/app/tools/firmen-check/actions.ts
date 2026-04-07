"use server";

import type { CompanyRiskResult, BoardMember, ShabPublication } from "@rappen/shared";
import { calculateRiskScore } from "@rappen/swiss-data";

export interface CompanyRiskActionResult {
	success: boolean;
	data?: CompanyRiskResult;
	error?: string;
}

/**
 * Demo data for the public preview.
 * In production, this will fetch live data from ZEFIX, SHAB, and UID-Register.
 */
const DEMO_COMPANIES: Record<string, {
	uid: string;
	name: string;
	legal_form: string;
	domicile: string;
	capital: string;
	status: string;
	founding_date: string;
	board_members: BoardMember[];
	shab_publications: ShabPublication[];
}> = {
	"CHE-100.000.001": {
		uid: "CHE-100.000.001",
		name: "Etablierte AG",
		legal_form: "AG",
		domicile: "Zürich, ZH",
		capital: "CHF 1'000'000",
		status: "aktiv",
		founding_date: "2008-04-12",
		board_members: [
			{ name: "Anna Müller", role: "Präsidentin", since: "2015-06-01", signature_type: "Einzelunterschrift" },
			{ name: "Peter Weber", role: "Mitglied", since: "2018-03-15", signature_type: "Kollektiv zu zweien" },
		],
		shab_publications: [],
	},
	"CHE-200.000.002": {
		uid: "CHE-200.000.002",
		name: "Wachstums GmbH",
		legal_form: "GmbH",
		domicile: "Bern, BE",
		capital: "CHF 200'000",
		status: "aktiv",
		founding_date: "2024-09-01",
		board_members: [
			{ name: "Sara Bühler", role: "Geschäftsführerin", since: "2024-09-01", signature_type: "Einzelunterschrift" },
		],
		shab_publications: [
			{
				date: "2026-02-10",
				type: "Kapitalerhöhung",
				message: "Stammkapital von CHF 100'000 auf CHF 200'000 erhöht",
				shab_id: "SHAB-2026-001",
			},
		],
	},
	"CHE-300.000.003": {
		uid: "CHE-300.000.003",
		name: "Krisen AG",
		legal_form: "AG",
		domicile: "Genf, GE",
		capital: "CHF 100'000",
		status: "aktiv",
		founding_date: "2025-01-20",
		board_members: [
			{ name: "Marc Dupont", role: "Präsident", since: "2026-01-15", signature_type: "Einzelunterschrift" },
			{ name: "Lisa Favre", role: "Mitglied", since: "2026-02-20", signature_type: "Kollektiv" },
			{ name: "Jean Martin", role: "Mitglied", since: "2026-03-10", signature_type: "Kollektiv" },
		],
		shab_publications: [
			{
				date: "2026-03-01",
				type: "Sitzverlegung",
				message: "Sitz von Lausanne nach Genf verlegt",
				shab_id: "SHAB-2026-100",
			},
			{
				date: "2026-03-25",
				type: "Konkursandrohung",
				message: "Konkursandrohung gemäss Art. 159 SchKG",
				shab_id: "SHAB-2026-150",
			},
		],
	},
};

export async function searchCompanyAction(formData: FormData): Promise<CompanyRiskActionResult> {
	const query = String(formData.get("query") ?? "").trim();

	if (!query) {
		return { success: false, error: "Bitte UID oder Firmennamen eingeben." };
	}

	// Lookup by UID or partial name match
	const normalizedQuery = query.toUpperCase().replace(/\s/g, "");
	let company = Object.values(DEMO_COMPANIES).find(
		(c) =>
			c.uid.replace(/\s/g, "") === normalizedQuery ||
			c.name.toLowerCase().includes(query.toLowerCase()),
	);

	if (!company) {
		return {
			success: false,
			error:
				"Keine Firma gefunden. Im Vorschau-Modus stehen folgende Demo-UIDs zur Verfügung:\n• CHE-100.000.001 (Etablierte AG)\n• CHE-200.000.002 (Wachstums GmbH)\n• CHE-300.000.003 (Krisen AG)",
		};
	}

	try {
		const data = calculateRiskScore({
			company: {
				uid: company.uid,
				name: company.name,
				legal_form: company.legal_form,
				domicile: company.domicile,
				capital: company.capital,
				status: company.status,
				founding_date: company.founding_date,
			},
			board_members: company.board_members,
			shab_publications: company.shab_publications,
		});
		return { success: true, data };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Bewertungsfehler",
		};
	}
}
