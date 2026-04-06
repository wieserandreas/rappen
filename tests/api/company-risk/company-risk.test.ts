import { describe, it, expect } from "vitest";
import { calculateRiskScore } from "@rappen/swiss-data";
import type { RiskSignal, BoardMember, ShabPublication } from "@rappen/shared";

function makeRiskInput(overrides: Partial<Parameters<typeof calculateRiskScore>[0]> = {}) {
	return {
		company: {
			uid: "CHE-123.456.789",
			name: "Test AG",
			legal_form: "AG",
			domicile: "Zürich",
			capital: "CHF 100'000",
			status: "aktiv",
			founding_date: "2015-03-15",
			...overrides.company,
		},
		board_members: overrides.board_members ?? [
			{ name: "Max Muster", role: "Präsident", since: "2020-01-01", signature_type: "Einzelunterschrift" },
		],
		shab_publications: overrides.shab_publications ?? [],
	};
}

describe("Company Risk – Base Score", () => {
	it("should give established company a good base score", () => {
		const result = calculateRiskScore(makeRiskInput());
		expect(result.risk_score).toBeGreaterThanOrEqual(80);
		expect(result.risk_level).toBe("low");
	});

	it("should penalize young companies (<2 years)", () => {
		const result = calculateRiskScore(makeRiskInput({
			company: { founding_date: "2025-06-01" } as any,
		}));
		expect(result.risk_score).toBeLessThan(80);
		expect(result.signals.some(s => s.type === "young_company")).toBe(true);
	});

	it("should reward long-established companies (>10 years)", () => {
		const result = calculateRiskScore(makeRiskInput({
			company: { founding_date: "2010-01-01" } as any,
		}));
		expect(result.signals.some(s => s.type === "long_established")).toBe(true);
		expect(result.risk_score).toBeGreaterThanOrEqual(85);
	});
});

describe("Company Risk – SHAB Signals", () => {
	it("should heavily penalize bankruptcy warning", () => {
		const result = calculateRiskScore(makeRiskInput({
			shab_publications: [{
				date: "2026-01-15",
				type: "Konkursandrohung",
				message: "Konkurs angedroht gemäss SchKG",
				shab_id: "SHAB-001",
			}],
		}));
		expect(result.risk_score).toBeLessThanOrEqual(50);
		expect(result.signals.some(s => s.type === "bankruptcy_warning")).toBe(true);
	});

	it("should penalize capital reduction", () => {
		const result = calculateRiskScore(makeRiskInput({
			shab_publications: [{
				date: "2026-02-01",
				type: "Kapitalherabsetzung",
				message: "Kapital von CHF 100'000 auf CHF 50'000 herabgesetzt",
				shab_id: "SHAB-002",
			}],
		}));
		expect(result.signals.some(s => s.type === "capital_reduction")).toBe(true);
	});

	it("should slightly reward capital increase", () => {
		const result = calculateRiskScore(makeRiskInput({
			shab_publications: [{
				date: "2026-02-01",
				type: "Kapitalerhöhung",
				message: "Kapital von CHF 100'000 auf CHF 200'000 erhöht",
				shab_id: "SHAB-003",
			}],
		}));
		expect(result.signals.some(s => s.type === "capital_increase")).toBe(true);
	});
});

describe("Company Risk – Board Changes", () => {
	it("should flag frequent board changes", () => {
		const result = calculateRiskScore(makeRiskInput({
			board_members: [
				{ name: "A", role: "VR", since: new Date().toISOString(), signature_type: "Kollektiv" },
				{ name: "B", role: "VR", since: new Date().toISOString(), signature_type: "Kollektiv" },
				{ name: "C", role: "VR", since: new Date().toISOString(), signature_type: "Kollektiv" },
			],
		}));
		expect(result.signals.some(s => s.type === "board_changes_frequent")).toBe(true);
	});
});

describe("Company Risk – Score Clamping", () => {
	it("should never go below 0", () => {
		const result = calculateRiskScore(makeRiskInput({
			company: { founding_date: "2025-06-01", status: "aktiv" } as any,
			shab_publications: [
				{ date: "2026-01-01", type: "Konkursandrohung", message: "Konkurs", shab_id: "1" },
				{ date: "2026-02-01", type: "Kapitalherabsetzung", message: "Kapital-", shab_id: "2" },
				{ date: "2026-03-01", type: "Liquidation", message: "Liquidation", shab_id: "3" },
			],
		}));
		expect(result.risk_score).toBeGreaterThanOrEqual(0);
		expect(result.risk_level).toBe("high");
	});

	it("should cap at 100", () => {
		const result = calculateRiskScore(makeRiskInput());
		expect(result.risk_score).toBeLessThanOrEqual(100);
	});
});
