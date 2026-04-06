import Decimal from "decimal.js";
import type { NeighborCountry } from "@rappen/shared";

/**
 * Telework/Home Office rules for cross-border workers.
 *
 * Since COVID, multilateral agreements regulate when telework from
 * the residence country triggers a change in tax/social security jurisdiction.
 *
 * [VERIFY] Confirm 2026 thresholds – these were set in 2023 framework agreement
 */
export interface TeleworkRule {
	country: NeighborCountry;
	/** Maximum telework percentage before jurisdiction change */
	max_telework_percent: Decimal;
	/** What happens when threshold is exceeded */
	consequence: string;
	/** A1 certificate implications */
	a1_impact: string;
	legal_basis: string;
}

export const TELEWORK_RULES: Record<NeighborCountry, TeleworkRule> = {
	DE: {
		country: "DE",
		max_telework_percent: new Decimal("49.9"),
		consequence: "Ab 50% Telework in DE: Sozialversicherungspflicht wechselt nach DE. Steuerliche Aufteilung nach Arbeitstagen.",
		a1_impact: "A1-Bescheinigung erforderlich. Bei >25% Telework: Multi-State-Worker Regelung (Art. 13 VO 883/2004).",
		legal_basis: "EU-Rahmenvereinbarung Grenzüberschreitendes Telearbeit (2023), VO 883/2004 Art. 13",
	},
	FR: {
		country: "FR",
		max_telework_percent: new Decimal("49.9"),
		consequence: "Ab 50% Telework in FR: Sozialversicherungspflicht wechselt nach FR. Fiskalisch: Aufteilung nach Tagen. Grenzgängerabkommen-Kantone: bis 40% Telework erlaubt ohne Statusänderung.",
		a1_impact: "A1-Bescheinigung erforderlich. Spezialabkommen CH-FR vom Juli 2023 erlaubt bis 40% Telework für Grenzgänger der 8 Abkommenskantone.",
		legal_basis: "Accord amiable CH-FR (2023), VO 883/2004 Art. 13",
	},
	IT: {
		country: "IT",
		max_telework_percent: new Decimal("25"),
		consequence: "Ab 25% Telework in IT: Sozialversicherungspflicht kann nach IT wechseln. Neues DBA regelt fiskalische Aufteilung.",
		a1_impact: "A1-Bescheinigung bei jeder grenzüberschreitenden Tätigkeit erforderlich.",
		legal_basis: "VO 883/2004 Art. 13, Neues Grenzgängerabkommen CH-IT",
	},
	AT: {
		country: "AT",
		max_telework_percent: new Decimal("49.9"),
		consequence: "Ab 50% Telework in AT: Sozialversicherungspflicht wechselt nach AT.",
		a1_impact: "A1-Bescheinigung erforderlich bei grenzüberschreitender Tätigkeit.",
		legal_basis: "EU-Rahmenvereinbarung (2023), VO 883/2004 Art. 13",
	},
	LI: {
		country: "LI",
		max_telework_percent: new Decimal("25"),
		consequence: "Ab 25% Telework ausserhalb LI/CH: Sozialversicherungskoordination nach Zollvertragsregeln.",
		a1_impact: "Spezialregelung im Rahmen des Zollvertrags CH-LI.",
		legal_basis: "Zollvertrag CH-LI, Sozialversicherungsabkommen",
	},
};
