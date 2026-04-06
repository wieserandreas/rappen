import type { NeighborCountry } from "@rappen/shared";

/**
 * Double Taxation Agreements (DBA) with neighboring countries.
 * Determines which country has the right to tax cross-border workers.
 *
 * [VERIFY] Confirm DBA CH-IT new agreement status for 2026
 */
export interface DbaRule {
	country: NeighborCountry;
	name_de: string;
	/** Does the cross-border worker pay tax in CH or residence country? */
	tax_in_ch: boolean;
	/** Special cross-border commuter rule applies */
	has_cross_border_rule: boolean;
	/** Relevant DBA article */
	article: string;
	/** Notes about specific rules */
	notes: string;
}

export const DBA_RULES: Record<NeighborCountry, DbaRule> = {
	DE: {
		country: "DE",
		name_de: "Deutschland",
		tax_in_ch: true,
		has_cross_border_rule: true,
		article: "Art. 15a DBA CH-DE",
		notes: "Grenzgänger werden im Wohnsitzstaat besteuert. CH erhebt max. 4.5% Quellensteuer. Grenzgänger = regelmässige Rückkehr an den Wohnsitz.",
	},
	FR: {
		country: "FR",
		name_de: "Frankreich",
		tax_in_ch: true,
		has_cross_border_rule: true,
		article: "Art. 17 DBA CH-FR (Grenzgängerabkommen 1983)",
		notes: "Grenzgänger der Kantone BE, BS, BL, JU, NE, SO, VD, VS werden im Wohnsitzstaat besteuert. CH zahlt Kompensation an FR (4.5% der Bruttolöhne). Kantone GE: Besteuerung in CH.",
	},
	IT: {
		country: "IT",
		name_de: "Italien",
		tax_in_ch: false,
		has_cross_border_rule: true,
		article: "Neues Grenzgängerabkommen CH-IT (2023, in Kraft seit 2024)",
		notes: "Neue Grenzgänger (ab 2024): Besteuerung in CH, IT erhebt bis max. 80% der normalen IT-Steuer. Alt-Grenzgänger: Ausschliessliche Besteuerung in CH.",
	},
	AT: {
		country: "AT",
		name_de: "Österreich",
		tax_in_ch: true,
		has_cross_border_rule: false,
		article: "Art. 15 DBA CH-AT",
		notes: "Keine spezielle Grenzgängerregelung. Besteuerung im Tätigkeitsstaat (CH). 60-Tage-Regel: bei >60 Übernachtungen in CH → Besteuerung in CH.",
	},
	LI: {
		country: "LI",
		name_de: "Liechtenstein",
		tax_in_ch: true,
		has_cross_border_rule: false,
		article: "Steuerabkommen CH-LI",
		notes: "Grenzgänger von LI nach CH: Besteuerung in CH. Grenzgänger von CH nach LI: Besteuerung in LI. Zollvertrag regelt Sozialversicherung.",
	},
};
