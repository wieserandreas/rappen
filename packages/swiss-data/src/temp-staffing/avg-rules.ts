import Decimal from "decimal.js";
import type { TempStaffingInput, TempStaffingResult, TempStaffingViolation } from "@rappen/shared";

/**
 * Personalverleih-Compliance (AVG – Arbeitsvermittlungsgesetz).
 *
 * Key rules:
 * - Art. 12: License requirement (SECO)
 * - Art. 19: Equal pay (gleicher Lohn wie Festangestellte)
 * - Art. 22: Maximum assignment duration (GAV-dependent)
 * - Caution: CHF 50'000 (CH only) / CHF 100'000 (CH + abroad)
 *
 * Legal basis: AVG Art. 12-22, AVV Art. 26-40
 */

const REQUIRED_CAUTION_CH_ONLY = new Decimal("50000");
const REQUIRED_CAUTION_CH_AND_ABROAD = new Decimal("100000");

/** Maximum assignment duration defaults (months), can be overridden by GAV */
const DEFAULT_MAX_ASSIGNMENT_MONTHS = 12;

/** Permit types that require special attention */
const RESTRICTED_PERMITS = ["L", "F", "N", "S"];

export function validateTempStaffing(input: TempStaffingInput): TempStaffingResult {
	const violations: TempStaffingViolation[] = [];
	const legalBasis: string[] = ["AVG Art. 12 (Bewilligungspflicht)", "AVG Art. 19 (Gleichbehandlung)"];

	// ── License check ──
	if (!input.agency.has_seco_license) {
		violations.push({
			rule: "Fehlende SECO-Bewilligung",
			article: "AVG Art. 12",
			severity: "error",
			message: "Personalverleih ist bewilligungspflichtig. Der Verleiher muss über eine gültige SECO-Bewilligung verfügen.",
		});
	}

	// ── Caution check ──
	const requiredCaution = input.agency.license_type === "ch_and_abroad"
		? REQUIRED_CAUTION_CH_AND_ABROAD
		: REQUIRED_CAUTION_CH_ONLY;

	if (!input.agency.has_caution) {
		violations.push({
			rule: "Fehlende Kaution",
			article: "AVV Art. 35",
			severity: "error",
			message: `Kaution von CHF ${requiredCaution.toFixed(0)} erforderlich.`,
		});
	} else if (input.agency.caution_amount != null) {
		const cautionAmount = new Decimal(input.agency.caution_amount);
		if (cautionAmount.lt(requiredCaution)) {
			violations.push({
				rule: "Ungenügende Kaution",
				article: "AVV Art. 35",
				severity: "error",
				message: `Kaution CHF ${cautionAmount.toFixed(0)} ist ungenügend. Erforderlich: CHF ${requiredCaution.toFixed(0)}.`,
			});
		}
	}

	// ── Assignment duration ──
	let maxAssignmentMonths = DEFAULT_MAX_ASSIGNMENT_MONTHS;
	if (input.assignment.start_date && input.assignment.end_date) {
		const start = new Date(input.assignment.start_date);
		const end = new Date(input.assignment.end_date);
		const durationMonths = (end.getTime() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000);

		if (durationMonths > maxAssignmentMonths) {
			violations.push({
				rule: "Maximale Einsatzdauer überschritten",
				article: "AVG Art. 22 / GAV",
				severity: "warning",
				message: `Einsatzdauer ${durationMonths.toFixed(0)} Monate übersteigt Maximum von ${maxAssignmentMonths} Monaten.`,
			});
		}
	}

	// ── Worker permit check ──
	if (RESTRICTED_PERMITS.includes(input.worker.permit_type)) {
		violations.push({
			rule: "Eingeschränkter Aufenthaltsstatus",
			article: "AVG Art. 18, AIG",
			severity: "warning",
			message: `Bewilligungstyp ${input.worker.permit_type} erfordert besondere Prüfung der Arbeitsberechtigung.`,
		});
	}

	// ── Foreign worker without CH/abroad license ──
	if (input.worker.permit_type === "G" && input.agency.license_type !== "ch_and_abroad") {
		violations.push({
			rule: "Grenzgänger-Verleih ohne Auslands-Bewilligung",
			article: "AVG Art. 12 Abs. 2",
			severity: "warning",
			message: "Verleih von Grenzgängern kann eine Bewilligung für Verleih ins/aus dem Ausland erfordern.",
		});
	}

	return {
		compliant: violations.filter((v) => v.severity === "error").length === 0,
		violations,
		max_assignment_duration: `${maxAssignmentMonths} Monate`,
		required_caution: `CHF ${requiredCaution.toFixed(0)}`,
		legal_basis: legalBasis,
	};
}
