import Decimal from "decimal.js";
import type { CrossBorderInput, CrossBorderResult } from "@rappen/shared";
import { DBA_RULES } from "./dba-treaties.js";
import { TELEWORK_RULES } from "./telework-rules.js";

/**
 * Cross-border worker analysis engine.
 * Determines tax jurisdiction, social security obligations,
 * telework implications, and LEADS reporting requirements.
 */
export function calculateCrossBorder(input: CrossBorderInput): CrossBorderResult {
	const dba = DBA_RULES[input.residence_country];
	const telework = TELEWORK_RULES[input.residence_country];
	const warnings: string[] = [];
	const legalBasis: string[] = [dba.article];

	// ── Telework analysis ──
	const teleworkPercent = new Decimal(input.telework_days_per_year)
		.div(input.total_work_days_per_year)
		.mul(100);

	const teleworkExceeded = teleworkPercent.gt(telework.max_telework_percent);

	if (teleworkExceeded) {
		warnings.push(
			`Telework-Anteil ${teleworkPercent.toFixed(1)}% übersteigt die Schwelle von ${telework.max_telework_percent}%. ` +
			telework.consequence,
		);
	}

	// ── Social security determination ──
	// Default: worker is insured in CH (country of employment)
	// Exception: >25% telework in residence country may shift to residence country
	const teleworkPercent25 = teleworkPercent.gt(25);
	let socialSecurityCountry = "CH";

	if (teleworkExceeded) {
		socialSecurityCountry = input.residence_country;
		warnings.push(
			`Sozialversicherungspflicht wechselt voraussichtlich nach ${dba.name_de}. Prüfung durch zuständige Behörde empfohlen.`,
		);
	}

	// ── A1 certificate ──
	const a1Required = input.telework_days_per_year > 0 || !input.has_g_permit;
	if (a1Required) {
		legalBasis.push("VO (EG) 883/2004 Art. 13");
	}

	// ── Withholding tax ──
	let withholdingTaxApplicable = true;
	if (input.residence_country === "DE" && dba.has_cross_border_rule) {
		// DE cross-border workers: max 4.5% QST in CH, main tax in DE
		warnings.push("Grenzgänger DE: Quellensteuer max. 4.5% in CH, Hauptbesteuerung in Deutschland.");
	}
	if (input.residence_country === "FR") {
		// FR: depends on canton
		const frAbkommensKantone = ["BE", "BS", "BL", "JU", "NE", "SO", "VD", "VS"];
		if (frAbkommensKantone.includes(input.work_canton)) {
			warnings.push(`Kanton ${input.work_canton}: Grenzgängerabkommen CH-FR. Besteuerung in Frankreich, CH zahlt Kompensation.`);
			withholdingTaxApplicable = false;
		} else {
			warnings.push(`Kanton ${input.work_canton}: Kein Grenzgängerabkommen-Kanton. Quellensteuer in CH.`);
		}
	}

	// ── LEADS reporting ──
	// LEADS (Lohngleichheitsdialog) is for large companies, but
	// cross-border LEADS XML reporting is for social security coordination
	const leadsRequired = input.telework_days_per_year > 0 && a1Required;

	return {
		tax_jurisdiction: withholdingTaxApplicable ? `CH (${input.work_canton})` : input.residence_country,
		social_security_country: socialSecurityCountry,
		withholding_tax_applicable: withholdingTaxApplicable,
		telework_threshold_exceeded: teleworkExceeded,
		telework_percentage: teleworkPercent.toFixed(1) + "%",
		a1_certificate_required: a1Required,
		leads_reporting_required: leadsRequired,
		dba_article: dba.article,
		warnings,
		legal_basis: legalBasis,
	};
}
