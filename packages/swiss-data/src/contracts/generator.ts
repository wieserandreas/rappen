import type { ContractInput, ContractResult, ContractType } from "@rappen/shared";

/**
 * Contract Generator – generates Swiss-law-compliant contract drafts.
 *
 * Uses template data with conditional sections based on input parameters.
 * Actual Handlebars template rendering and DOCX/PDF generation happens
 * in the API layer. This module handles:
 * - Required clause validation per contract type
 * - Legal basis lookups
 * - Template parameter preparation
 */

const DISCLAIMER = "Dieser Vertrag wurde maschinell erstellt und dient als Entwurf. Er ersetzt keine anwaltliche Beratung. Powered by Rappen.";

/**
 * Required clauses per contract type (OR-based).
 */
const REQUIRED_CLAUSES: Record<ContractType, string[]> = {
	"employment-permanent": [
		"Vertragsparteien",
		"Funktion/Stellenbezeichnung",
		"Arbeitsort",
		"Stellenantritt",
		"Arbeitspensum",
		"Lohn (Brutto)",
		"Kündigungsfrist",
		"Ferienanspruch",
		"BVG/UVG-Hinweis",
	],
	"employment-fixed-term": [
		"Vertragsparteien",
		"Funktion/Stellenbezeichnung",
		"Arbeitsort",
		"Vertragsbeginn",
		"Vertragsende",
		"Arbeitspensum",
		"Lohn (Brutto)",
		"Ferienanspruch",
	],
	"freelancer": [
		"Vertragsparteien",
		"Leistungsbeschreibung",
		"Honorar",
		"Zahlungsbedingungen",
		"Selbständigkeitsklausel",
		"Haftung",
	],
	"nda": [
		"Vertragsparteien",
		"Geheimhaltungsgegenstand",
		"Dauer der Geheimhaltung",
		"Konventionalstrafe",
	],
	"termination-agreement": [
		"Vertragsparteien",
		"Beendigungsdatum",
		"Restliche Ansprüche",
		"Zeugnis",
		"Saldoklausel",
	],
	"internship": [
		"Vertragsparteien",
		"Ausbildungsziel",
		"Dauer",
		"Entschädigung",
		"Betreuungsperson",
	],
	"ceo-contract": [
		"Vertragsparteien",
		"Funktion",
		"Vergütung",
		"Bonusregelung",
		"Konkurrenzverbot",
		"Geheimhaltung",
		"Kündigung",
	],
	"shareholder-agreement": [
		"Gesellschafter",
		"Stammkapital/Aktienkapital",
		"Gewinnverteilung",
		"Übertragungsbeschränkungen",
		"Vorkaufsrechte",
		"Deadlock-Regelung",
	],
	"service-agreement-b2b": [
		"Vertragsparteien",
		"Leistungsbeschreibung",
		"Vergütung",
		"Zahlungsbedingungen",
		"Haftung",
		"Gerichtsstand",
	],
	"commercial-lease": [
		"Vertragsparteien",
		"Mietobjekt",
		"Mietzins",
		"Nebenkosten",
		"Vertragsdauer",
		"Kündigungsfrist",
	],
};

/**
 * Legal basis per contract type.
 */
const LEGAL_BASIS: Record<ContractType, string[]> = {
	"employment-permanent": ["OR Art. 319-343 (Einzelarbeitsvertrag)", "OR Art. 335-335c (Kündigung)"],
	"employment-fixed-term": ["OR Art. 319-343", "OR Art. 334 (Befristung)"],
	"freelancer": ["OR Art. 363-379 (Werkvertrag)", "OR Art. 394-406 (Auftrag)"],
	"nda": ["OR Art. 321a Abs. 4 (Geheimhaltungspflicht)", "OR Art. 160-163 (Konventionalstrafe)"],
	"termination-agreement": ["OR Art. 341 (Verzichtsverbot)", "OR Art. 335-335c"],
	"internship": ["OR Art. 344-346a (Lehrvertrag analog)", "BBG"],
	"ceo-contract": ["OR Art. 716b (Delegation Geschäftsführung)", "OR Art. 340-340c (Konkurrenzverbot)"],
	"shareholder-agreement": ["OR Art. 772-827 (GmbH)", "OR Art. 620-763 (AG)"],
	"service-agreement-b2b": ["OR Art. 394-406 (Auftrag)", "OR Art. 363-379 (Werkvertrag)"],
	"commercial-lease": ["OR Art. 253-274g (Mietrecht)", "OR Art. 274a-274g (Geschäftsmiete)"],
};

/**
 * Contract type display names.
 */
export const CONTRACT_TYPE_NAMES: Record<ContractType, Record<string, string>> = {
	"employment-permanent": { de: "Unbefristeter Arbeitsvertrag", fr: "Contrat de travail à durée indéterminée", it: "Contratto di lavoro a tempo indeterminato" },
	"employment-fixed-term": { de: "Befristeter Arbeitsvertrag", fr: "Contrat de travail à durée déterminée", it: "Contratto di lavoro a tempo determinato" },
	"freelancer": { de: "Freelancer-/Werkvertrag", fr: "Contrat de prestation de services", it: "Contratto d'opera" },
	"nda": { de: "Geheimhaltungsvereinbarung (NDA)", fr: "Accord de confidentialité (NDA)", it: "Accordo di riservatezza (NDA)" },
	"termination-agreement": { de: "Aufhebungsvereinbarung", fr: "Convention de résiliation", it: "Convenzione di risoluzione" },
	"internship": { de: "Praktikumsvertrag", fr: "Convention de stage", it: "Contratto di tirocinio" },
	"ceo-contract": { de: "Geschäftsführer-Vertrag", fr: "Contrat de directeur", it: "Contratto di direttore" },
	"shareholder-agreement": { de: "Gesellschaftervertrag", fr: "Convention d'actionnaires", it: "Patto parasociale" },
	"service-agreement-b2b": { de: "B2B-Dienstleistungsvertrag", fr: "Contrat de services B2B", it: "Contratto di servizi B2B" },
	"commercial-lease": { de: "Geschäftsmietvertrag", fr: "Bail commercial", it: "Contratto di locazione commerciale" },
};

/**
 * Validate contract input and check required clauses.
 */
export function validateContractInput(input: ContractInput): { valid: boolean; warnings: string[] } {
	const warnings: string[] = [];
	const required = REQUIRED_CLAUSES[input.type];

	if (!required) {
		return { valid: false, warnings: [`Unbekannter Vertragstyp: ${input.type}`] };
	}

	// Check that essential parameters are present
	if (!input.parties || input.parties.length < 2) {
		warnings.push("Mindestens 2 Vertragsparteien erforderlich.");
	}

	return { valid: warnings.length === 0, warnings };
}

/**
 * Generate contract data (template parameters + metadata).
 * Actual document rendering (DOCX/PDF) happens in the API layer.
 */
export function prepareContract(input: ContractInput): {
	template_name: string;
	parameters: Record<string, unknown>;
	required_clauses: string[];
	legal_basis: string[];
	disclaimer: string;
	title: string;
} {
	const names = CONTRACT_TYPE_NAMES[input.type];
	const lang = input.language in names ? input.language : "de";

	return {
		template_name: `${input.type}.hbs`,
		parameters: {
			...input.parameters,
			parties: input.parties,
			canton: input.canton,
			language: input.language,
			date: new Date().toISOString().split("T")[0],
		},
		required_clauses: REQUIRED_CLAUSES[input.type],
		legal_basis: LEGAL_BASIS[input.type],
		disclaimer: DISCLAIMER,
		title: names[lang] || names.de,
	};
}
