import type { CompanyRiskResult, RiskSignal, BoardMember, ShabPublication } from "@rappen/shared";

/**
 * Company Risk Score model (0-100).
 *
 * Base score: 80 (default for any registered company)
 * Signals adjust score up or down.
 *
 * Risk levels:
 * - 80-100: Low risk (green)
 * - 50-79: Medium risk (yellow)
 * - 20-49: Elevated risk (orange)
 * - 0-19: High risk (red)
 */

export interface RiskInput {
	company: {
		uid: string;
		name: string;
		legal_form: string;
		domicile: string;
		capital: string;
		status: string;
		founding_date: string;
	};
	board_members: BoardMember[];
	shab_publications: ShabPublication[];
}

/** Signal weights for risk calculation */
const SIGNAL_WEIGHTS: Record<string, { points: number; severity: RiskSignal["severity"] }> = {
	capital_reduction: { points: -25, severity: "critical" },
	board_changes_frequent: { points: -15, severity: "warning" },
	domicile_change: { points: -10, severity: "warning" },
	bankruptcy_warning: { points: -40, severity: "critical" },
	young_company: { points: -10, severity: "info" },
	high_risk_industry: { points: -5, severity: "info" },
	liquidation: { points: -35, severity: "critical" },
	capital_increase: { points: 5, severity: "info" },
	long_established: { points: 10, severity: "info" },
};

/**
 * Calculate company risk score from gathered data.
 */
export function calculateRiskScore(input: RiskInput): CompanyRiskResult {
	const signals: RiskSignal[] = [];
	let score = 80; // Base score

	// ── Company age ──
	const foundingDate = new Date(input.company.founding_date);
	const ageYears = (Date.now() - foundingDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

	if (ageYears < 2) {
		const w = SIGNAL_WEIGHTS.young_company;
		score += w.points;
		signals.push({
			type: "young_company",
			severity: w.severity,
			date: input.company.founding_date,
			description: `Unternehmen ist weniger als 2 Jahre alt (${ageYears.toFixed(1)} Jahre).`,
			impact_points: w.points,
		});
	} else if (ageYears > 10) {
		const w = SIGNAL_WEIGHTS.long_established;
		score += w.points;
		signals.push({
			type: "long_established",
			severity: w.severity,
			date: input.company.founding_date,
			description: `Unternehmen seit ${Math.floor(ageYears)} Jahren im Handelsregister.`,
			impact_points: w.points,
		});
	}

	// ── Board member changes ──
	const recentBoardChanges = countRecentBoardChanges(input.board_members);
	if (recentBoardChanges > 2) {
		const w = SIGNAL_WEIGHTS.board_changes_frequent;
		score += w.points;
		signals.push({
			type: "board_changes_frequent",
			severity: w.severity,
			date: new Date().toISOString().split("T")[0],
			description: `${recentBoardChanges} VR-Wechsel in den letzten 12 Monaten.`,
			impact_points: w.points,
		});
	}

	// ── SHAB publications ──
	for (const pub of input.shab_publications) {
		const pubType = pub.type.toLowerCase();

		if (pubType.includes("konkurs") || pubType.includes("faillite")) {
			const w = SIGNAL_WEIGHTS.bankruptcy_warning;
			score += w.points;
			signals.push({
				type: "bankruptcy_warning",
				severity: w.severity,
				date: pub.date,
				description: `SHAB-Publikation: ${pub.message}`,
				impact_points: w.points,
			});
		}

		if (pubType.includes("kapitalherabsetzung") || pubType.includes("réduction du capital")) {
			const w = SIGNAL_WEIGHTS.capital_reduction;
			score += w.points;
			signals.push({
				type: "capital_reduction",
				severity: w.severity,
				date: pub.date,
				description: `Kapitalherabsetzung publiziert: ${pub.message}`,
				impact_points: w.points,
			});
		}

		if (pubType.includes("kapitalerhöhung") || pubType.includes("augmentation du capital")) {
			const w = SIGNAL_WEIGHTS.capital_increase;
			score += w.points;
			signals.push({
				type: "capital_increase",
				severity: w.severity,
				date: pub.date,
				description: `Kapitalerhöhung publiziert: ${pub.message}`,
				impact_points: w.points,
			});
		}

		if (pubType.includes("liquidation")) {
			const w = SIGNAL_WEIGHTS.liquidation;
			score += w.points;
			signals.push({
				type: "liquidation",
				severity: w.severity,
				date: pub.date,
				description: `Liquidation publiziert: ${pub.message}`,
				impact_points: w.points,
			});
		}

		if (pubType.includes("sitzverlegung") || pubType.includes("transfert de siège")) {
			const w = SIGNAL_WEIGHTS.domicile_change;
			score += w.points;
			signals.push({
				type: "domicile_change",
				severity: w.severity,
				date: pub.date,
				description: `Sitzverlegung: ${pub.message}`,
				impact_points: w.points,
			});
		}
	}

	// ── Company status ──
	if (input.company.status === "in Liquidation" || input.company.status === "gelöscht") {
		score = Math.min(score, 10);
	}

	// Clamp score
	score = Math.max(0, Math.min(100, score));

	const riskLevel = score >= 80 ? "low" : score >= 50 ? "medium" : score >= 20 ? "elevated" : "high";

	return {
		company: input.company,
		risk_score: score,
		risk_level: riskLevel,
		signals,
		board_members: input.board_members,
		shab_publications: input.shab_publications,
	};
}

function countRecentBoardChanges(members: BoardMember[]): number {
	const oneYearAgo = new Date();
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

	return members.filter((m) => {
		const since = new Date(m.since);
		return since >= oneYearAgo;
	}).length;
}
