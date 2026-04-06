import type { TariffCode } from "@rappen/shared";

/**
 * Withholding tax tariff codes according to Swiss federal regulation.
 * Each code determines the applicable tax rate based on personal situation.
 */
export interface TariffCodeInfo {
	code: TariffCode;
	description_de: string;
	description_fr: string;
	applies_to: string;
}

export const TARIFF_CODES: Record<TariffCode, TariffCodeInfo> = {
	A: {
		code: "A",
		description_de: "Alleinstehende (ledig, geschieden, verwitwet, getrennt) ohne Kinder",
		description_fr: "Personnes seules (célibataires, divorcées, veuves, séparées) sans enfants",
		applies_to: "Single without children",
	},
	B: {
		code: "B",
		description_de: "Verheiratete Alleinverdiener",
		description_fr: "Personnes mariées à revenu unique",
		applies_to: "Married sole earner",
	},
	C: {
		code: "C",
		description_de: "Verheiratete Doppelverdiener",
		description_fr: "Personnes mariées à double revenu",
		applies_to: "Married dual earner",
	},
	D: {
		code: "D",
		description_de: "Nebenerwerbseinkommen",
		description_fr: "Revenu d'une activité accessoire",
		applies_to: "Secondary income",
	},
	E: {
		code: "E",
		description_de: "Quellensteuer im Abrechnungsverfahren",
		description_fr: "Impôt à la source dans la procédure de décompte",
		applies_to: "Withholding tax settlement procedure",
	},
	F: {
		code: "F",
		description_de: "Grenzgänger aus Italien",
		description_fr: "Frontaliers italiens",
		applies_to: "Italian cross-border commuters",
	},
	G: {
		code: "G",
		description_de: "Ersetzte Einkünfte (Renten, Taggelder)",
		description_fr: "Revenus de remplacement (rentes, indemnités journalières)",
		applies_to: "Replacement income (pensions, daily allowances)",
	},
	H: {
		code: "H",
		description_de: "Alleinstehende mit Kindern",
		description_fr: "Personnes seules avec enfants",
		applies_to: "Single with children",
	},
};

/**
 * Build full tariff code string: e.g., "B2Y" = married, 2 children, church member
 */
export function buildTariffCodeString(
	code: TariffCode,
	children: number,
	churchMember: boolean,
): string {
	const childSuffix = Math.min(children, 9).toString();
	const churchSuffix = churchMember ? "Y" : "N";
	return `${code}${childSuffix}${churchSuffix}`;
}
