"use server";

import type { CompanyRiskResult, BoardMember, ShabPublication } from "@rappen/shared";
import { calculateRiskScore } from "@rappen/swiss-data";

export interface CompanyRiskActionResult {
	success: boolean;
	data?: CompanyRiskResult;
	error?: string;
}

/**
 * ZEFIX Public REST API – requires Basic Auth credentials.
 * Register for free at: https://www.zefix.admin.ch
 *
 * Env vars needed:
 *   ZEFIX_API_USER — username from ZEFIX registration
 *   ZEFIX_API_PASSWORD — password from ZEFIX registration
 */
const ZEFIX_BASE = "https://www.zefix.admin.ch/ZefixPublicREST/api/v1";

function getZefixAuthHeader(): string | null {
	const user = process.env.ZEFIX_API_USER;
	const pass = process.env.ZEFIX_API_PASSWORD;
	if (!user || !pass) return null;
	return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

interface ZefixCompany {
	uid: string;
	name: string;
	legalSeatId?: number;
	legalSeat?: string;
	canton?: string;
	status?: string;
	registryOfCommerceId?: string;
	cantonalExcerptWeb?: string;
	legalForm?: { uid?: string; name?: { de?: string; fr?: string; it?: string } };
	shabDate?: string;
	deleteDate?: string;
	capitalNominal?: number;
	capitalCurrency?: string;
}

/**
 * Search ZEFIX for a company by name or UID.
 * Falls back to UID-Register format parsing if the query looks like a UID.
 */
async function searchZefix(query: string): Promise<ZefixCompany | null> {
	const auth = getZefixAuthHeader();
	if (!auth) {
		return null; // No credentials configured
	}

	const normalizedQuery = query.trim();
	const uidClean = normalizedQuery.replace(/[\s.-]/g, "").toUpperCase();
	const isUid = /^CHE\d{9}$/.test(uidClean);

	const baseHeaders: Record<string, string> = {
		Accept: "application/json",
		Authorization: auth,
	};

	try {
		if (isUid) {
			const res = await fetch(`${ZEFIX_BASE}/company/uid/${uidClean}`, {
				headers: baseHeaders,
				next: { revalidate: 86400 },
			});
			if (res.ok) {
				const data = await res.json();
				return data as ZefixCompany;
			}
		}

		const res = await fetch(`${ZEFIX_BASE}/company/search`, {
			method: "POST",
			headers: {
				...baseHeaders,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: normalizedQuery,
				languageKey: "de",
				maxEntries: 1,
			}),
			next: { revalidate: 86400 },
		});

		if (res.ok) {
			const data = await res.json();
			if (Array.isArray(data) && data.length > 0) {
				return data[0] as ZefixCompany;
			}
		}

		return null;
	} catch (err) {
		console.log("[firmen-check] ZEFIX API error:", err instanceof Error ? err.message : err);
		return null;
	}
}

/**
 * Format a UID number into the standard CHE-xxx.xxx.xxx format.
 */
function formatUid(uid: string): string {
	const clean = uid.replace(/\s/g, "");
	if (/^CHE\d{9}$/.test(clean)) {
		return `${clean.slice(0, 3)}-${clean.slice(3, 6)}.${clean.slice(6, 9)}.${clean.slice(9, 12)}`;
	}
	return uid;
}

export async function searchCompanyAction(formData: FormData): Promise<CompanyRiskActionResult> {
	const query = String(formData.get("query") ?? "").trim();

	if (!query) {
		return { success: false, error: "Bitte UID oder Firmennamen eingeben." };
	}

	if (query.length < 3) {
		return { success: false, error: "Bitte mindestens 3 Zeichen eingeben." };
	}

	// Check if ZEFIX credentials are configured
	if (!process.env.ZEFIX_API_USER || !process.env.ZEFIX_API_PASSWORD) {
		return {
			success: false,
			error: "Der Firmen-Check ist derzeit nicht verfügbar. Die ZEFIX-API-Anbindung wird eingerichtet.",
		};
	}

	const company = await searchZefix(query);

	if (!company) {
		return {
			success: false,
			error: `Keine Firma gefunden für «${query}». Bitte prüfen Sie den Namen oder die UID (Format: CHE-xxx.xxx.xxx).`,
		};
	}

	const formattedUid = formatUid(company.uid);
	const legalFormName = company.legalForm?.name?.de || company.legalForm?.uid || "—";
	const capital = company.capitalNominal
		? `${company.capitalCurrency || "CHF"} ${company.capitalNominal.toLocaleString("de-CH")}`
		: "—";

	// Determine founding date (approximate from ZEFIX data).
	// ZEFIX doesn't expose founding date directly; use shabDate as proxy.
	const foundingDate = company.shabDate || "2020-01-01";

	// Determine status
	let status = "aktiv";
	if (company.deleteDate) {
		status = "gelöscht";
	} else if (company.status === "CANCELLED") {
		status = "gelöscht";
	} else if (company.status === "BEING_CANCELLED") {
		status = "in Liquidation";
	}

	try {
		const data = calculateRiskScore({
			company: {
				uid: formattedUid,
				name: company.name,
				legal_form: legalFormName,
				domicile: [company.legalSeat, company.canton].filter(Boolean).join(", ") || "—",
				capital,
				status,
				founding_date: foundingDate,
			},
			board_members: [], // ZEFIX REST API doesn't expose VR — would need HR-Auszug
			shab_publications: [], // Would need SHAB scraper
		});
		return { success: true, data };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Bewertungsfehler",
		};
	}
}
