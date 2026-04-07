import { describe, it, expect } from "vitest";
import {
	calculatePayroll,
	calculateWithholdingTax,
	calculateVat,
	validateQrBill,
	generateQrBillPayload,
	parseQrBillPayload,
	validateWorktime,
	analyzePayEquity,
	prepareContract,
	validateContractInput,
	calculateCrossBorder,
	calculateRiskScore,
	validateTempStaffing,
} from "@rappen/swiss-data";
import { CANTONS } from "@rappen/shared";

/**
 * END-TO-END TEST OF ALL 10 TOOLS WITH REALISTIC INPUT
 *
 * This is the closest test to "user clicks submit on the website".
 * Each test exercises the same code path that a real form submission
 * would take through the Server Actions.
 */

describe("E2E – All 10 tools work with realistic production input", () => {
	// ════════════════════════════════════════════════════════════════
	// API 1 — Lohnberechnung
	// ════════════════════════════════════════════════════════════════
	it("Tool 1: Lohnrechner", () => {
		const result = calculatePayroll({
			canton: "ZH",
			gross_monthly: 8500,
			birth_year: 1990,
			marital_status: "single",
			children: 0,
			church: "keine",
			withholding_tax: false,
			bvg_plan: "minimum",
			uvg_nbu_rate: 1.5,
			employment_percentage: 100,
			thirteenth_salary: false,
		});
		expect(parseFloat(result.net_salary)).toBeGreaterThan(7000);
		expect(parseFloat(result.net_salary)).toBeLessThan(8500);
		expect(result.ahv_iv_eo.employee).toBe("450.50");
	});

	// ════════════════════════════════════════════════════════════════
	// API 2 — Quellensteuer
	// ════════════════════════════════════════════════════════════════
	it("Tool 2: Quellensteuer (ZH only — others not yet implemented)", () => {
		const result = calculateWithholdingTax({
			canton: "ZH",
			year: 2026,
			tariff_code: "A",
			children: 0,
			church: "keine",
			gross_monthly: 8500,
			thirteenth_salary: false,
		});
		expect(parseFloat(result.tax_amount)).toBeGreaterThan(0);
		expect(result.canton).toBe("ZH");
		expect(result.tariff_code_full).toBe("A0N");
	});

	it("Tool 2: Quellensteuer throws for unsupported cantons (gap documented)", () => {
		// Document the gap: Quellensteuer only has ZH tariffs.
		// All other 25 cantons should throw a clear error message.
		const unsupportedCantons = CANTONS.filter((c) => c !== "ZH");
		for (const canton of unsupportedCantons.slice(0, 5)) {
			expect(() =>
				calculateWithholdingTax({
					canton,
					year: 2026,
					tariff_code: "A",
					children: 0,
					church: "keine",
					gross_monthly: 8500,
					thirteenth_salary: false,
				}),
			).toThrow(/Keine Quellensteuertarife/);
		}
	});

	// ════════════════════════════════════════════════════════════════
	// API 3 — QR-Rechnung
	// ════════════════════════════════════════════════════════════════
	it("Tool 3: QR-Rechnung — generate, validate, parse roundtrip", () => {
		const input = {
			creditor: {
				name: "Rappen AG",
				street: "Bahnhofstrasse",
				building_number: "10",
				postal_code: "8001",
				city: "Zürich",
				country: "CH",
			},
			amount: 1500.5,
			currency: "CHF" as const,
			reference_type: "QRR" as const,
			reference: "210000000003139471430009017",
			iban: "CH4431999123000889012",
			language: "de" as const,
		};

		const validation = validateQrBill(input);
		expect(validation.valid).toBe(true);

		const payload = generateQrBillPayload(input);
		expect(payload.startsWith("SPC")).toBe(true);

		const parsed = parseQrBillPayload(payload);
		expect(parsed?.iban).toBe("CH4431999123000889012");
		expect(parsed?.amount).toBeCloseTo(1500.5);
	});

	// ════════════════════════════════════════════════════════════════
	// API 4 — MWST
	// ════════════════════════════════════════════════════════════════
	it("Tool 4: MWST — effective method", () => {
		const result = calculateVat({
			transactions: [
				{ description: "Beratung", amount: 50000, rate_type: "normal" },
				{ description: "Buch", amount: 200, rate_type: "reduced" },
				{ description: "Hotel", amount: 800, rate_type: "accommodation" },
			],
			method: "effective",
			period: { from: "2026-01-01", to: "2026-03-31" },
			include_reverse_charge: false,
		});
		// 50000*8.1% + 200*2.6% + 800*3.8% = 4050 + 5.20 + 30.40 = 4085.60
		expect(parseFloat(result.vat_payable)).toBeCloseTo(4085.6, 1);
		expect(result.breakdown).toHaveLength(3);
	});

	it("Tool 4: MWST — saldo method", () => {
		const result = calculateVat({
			transactions: [{ description: "IT-Beratung", amount: 200000, rate_type: "normal" }],
			method: "saldo",
			saldo_rate_code: "20", // Informatik 6.4%
			period: { from: "2026-01-01", to: "2026-12-31" },
			include_reverse_charge: false,
		});
		expect(parseFloat(result.vat_payable)).toBe(12800); // 200000 * 6.4%
	});

	// ════════════════════════════════════════════════════════════════
	// API 5 — Arbeitszeit
	// ════════════════════════════════════════════════════════════════
	it("Tool 5: Arbeitszeit — compliant week", () => {
		const result = validateWorktime({
			entries: [
				{ date: "2026-04-06", start: "08:00", end: "17:00", break_minutes: 60, type: "regular" },
				{ date: "2026-04-07", start: "08:00", end: "17:00", break_minutes: 60, type: "regular" },
				{ date: "2026-04-08", start: "08:00", end: "17:00", break_minutes: 60, type: "regular" },
				{ date: "2026-04-09", start: "08:00", end: "17:00", break_minutes: 60, type: "regular" },
				{ date: "2026-04-10", start: "08:00", end: "17:00", break_minutes: 60, type: "regular" },
			],
			employee: {
				age: 30,
				industry: "office",
				has_night_permit: false,
				has_sunday_permit: false,
			},
			year: 2026,
		});
		expect(result.compliant).toBe(true);
		expect(parseFloat(result.summary.total_hours)).toBeCloseTo(40, 0);
	});

	it("Tool 5: Arbeitszeit — detects break violation", () => {
		const result = validateWorktime({
			entries: [{ date: "2026-04-06", start: "07:00", end: "18:00", break_minutes: 15, type: "regular" }],
			employee: { age: 30, industry: "office", has_night_permit: false, has_sunday_permit: false },
			year: 2026,
		});
		expect(result.compliant).toBe(false);
		expect(result.violations.some((v) => v.article === "Art. 15 ArG")).toBe(true);
	});

	// ════════════════════════════════════════════════════════════════
	// API 6 — Lohngleichheit
	// ════════════════════════════════════════════════════════════════
	it("Tool 6: Lohngleichheit — accepts 12-employee dataset", () => {
		const employees = [
			{ id: "1", gender: "M" as const, salary_monthly: 7500, education_level: 2 as const, potential_experience_years: 5, service_years: 2, skill_level: 1 as const, professional_position: 2 as const, employment_percentage: 100 },
			{ id: "2", gender: "M" as const, salary_monthly: 8500, education_level: 3 as const, potential_experience_years: 10, service_years: 5, skill_level: 2 as const, professional_position: 3 as const, employment_percentage: 100 },
			{ id: "3", gender: "M" as const, salary_monthly: 9500, education_level: 4 as const, potential_experience_years: 15, service_years: 8, skill_level: 3 as const, professional_position: 4 as const, employment_percentage: 100 },
			{ id: "4", gender: "M" as const, salary_monthly: 10500, education_level: 5 as const, potential_experience_years: 20, service_years: 12, skill_level: 4 as const, professional_position: 5 as const, employment_percentage: 100 },
			{ id: "5", gender: "M" as const, salary_monthly: 8000, education_level: 3 as const, potential_experience_years: 8, service_years: 4, skill_level: 2 as const, professional_position: 2 as const, employment_percentage: 100 },
			{ id: "6", gender: "M" as const, salary_monthly: 9000, education_level: 4 as const, potential_experience_years: 12, service_years: 6, skill_level: 3 as const, professional_position: 3 as const, employment_percentage: 100 },
			{ id: "7", gender: "F" as const, salary_monthly: 7500, education_level: 2 as const, potential_experience_years: 5, service_years: 2, skill_level: 1 as const, professional_position: 2 as const, employment_percentage: 100 },
			{ id: "8", gender: "F" as const, salary_monthly: 8500, education_level: 3 as const, potential_experience_years: 10, service_years: 5, skill_level: 2 as const, professional_position: 3 as const, employment_percentage: 100 },
			{ id: "9", gender: "F" as const, salary_monthly: 9500, education_level: 4 as const, potential_experience_years: 15, service_years: 8, skill_level: 3 as const, professional_position: 4 as const, employment_percentage: 100 },
			{ id: "10", gender: "F" as const, salary_monthly: 10500, education_level: 5 as const, potential_experience_years: 20, service_years: 12, skill_level: 4 as const, professional_position: 5 as const, employment_percentage: 100 },
			{ id: "11", gender: "F" as const, salary_monthly: 8000, education_level: 3 as const, potential_experience_years: 8, service_years: 4, skill_level: 2 as const, professional_position: 2 as const, employment_percentage: 100 },
			{ id: "12", gender: "F" as const, salary_monthly: 9000, education_level: 4 as const, potential_experience_years: 12, service_years: 6, skill_level: 3 as const, professional_position: 3 as const, employment_percentage: 100 },
		];
		const result = analyzePayEquity({ employees, company_name: "Test AG", analysis_date: "2026-04-07" });
		expect(result.compliant).toBe(true);
		expect(result.sample_size).toBe(12);
	});

	// ════════════════════════════════════════════════════════════════
	// API 7 — Verträge
	// ════════════════════════════════════════════════════════════════
	it("Tool 7: Vertragsgenerator — all 10 contract types", () => {
		const types = [
			"employment-permanent",
			"employment-fixed-term",
			"freelancer",
			"nda",
			"termination-agreement",
			"internship",
			"ceo-contract",
			"shareholder-agreement",
			"service-agreement-b2b",
			"commercial-lease",
		] as const;

		for (const type of types) {
			const input = {
				type,
				language: "de" as const,
				canton: "ZH" as const,
				parties: [
					{ role: "employer" as const, name: "Rappen AG", address: "A", city: "Zürich", postal_code: "8001" },
					{ role: "employee" as const, name: "Max Muster", address: "B", city: "Zürich", postal_code: "8002" },
				],
				parameters: {},
			};
			const validation = validateContractInput(input);
			expect(validation.valid, `Validation failed for ${type}`).toBe(true);
			const prepared = prepareContract(input);
			expect(prepared.title.length).toBeGreaterThan(0);
			expect(prepared.legal_basis.length).toBeGreaterThan(0);
		}
	});

	// ════════════════════════════════════════════════════════════════
	// API 8 — Grenzgänger
	// ════════════════════════════════════════════════════════════════
	it("Tool 8: Grenzgänger — DE worker, ZH workplace, low telework", () => {
		const result = calculateCrossBorder({
			residence_country: "DE",
			work_canton: "ZH",
			gross_annual: 100000,
			telework_days_per_year: 20,
			total_work_days_per_year: 220,
			marital_status: "single",
			children: 0,
			nationality: "DE",
			has_g_permit: true,
		});
		expect(result.social_security_country).toBe("CH");
		expect(result.telework_threshold_exceeded).toBe(false);
		expect(result.a1_certificate_required).toBe(true);
	});

	// ════════════════════════════════════════════════════════════════
	// API 9 — Firmen-Risiko
	// ════════════════════════════════════════════════════════════════
	it("Tool 9: Firmen-Check — established company gets low risk", () => {
		const result = calculateRiskScore({
			company: {
				uid: "CHE-100.000.001",
				name: "Etablierte AG",
				legal_form: "AG",
				domicile: "Zürich",
				capital: "CHF 1'000'000",
				status: "aktiv",
				founding_date: "2008-04-12",
			},
			board_members: [
				{ name: "A", role: "VR", since: "2015-01-01", signature_type: "Einzel" },
			],
			shab_publications: [],
		});
		expect(result.risk_score).toBeGreaterThanOrEqual(80);
		expect(result.risk_level).toBe("low");
	});

	it("Tool 9: Firmen-Check — bankruptcy warning gets high risk", () => {
		const result = calculateRiskScore({
			company: {
				uid: "CHE-300.000.003",
				name: "Krisen AG",
				legal_form: "AG",
				domicile: "Genf",
				capital: "CHF 100'000",
				status: "aktiv",
				founding_date: "2025-01-20",
			},
			board_members: [],
			shab_publications: [
				{ date: "2026-03-25", type: "Konkursandrohung", message: "K", shab_id: "1" },
			],
		});
		expect(result.risk_score).toBeLessThan(50);
	});

	// ════════════════════════════════════════════════════════════════
	// API 10 — Personalverleih
	// ════════════════════════════════════════════════════════════════
	it("Tool 10: Personalverleih — compliant assignment", () => {
		const result = validateTempStaffing({
			assignment: {
				start_date: "2026-04-01",
				end_date: "2026-09-01",
				canton: "ZH",
				industry: "IT",
			},
			worker: {
				nationality: "CH",
				permit_type: "CH",
				hourly_rate: 55,
				employment_percentage: 100,
			},
			agency: {
				has_seco_license: true,
				license_type: "ch_only",
				has_caution: true,
				caution_amount: 50000,
			},
		});
		expect(result.compliant).toBe(true);
		expect(result.required_caution).toBe("CHF 50000");
	});

	it("Tool 10: Personalverleih — flags missing license", () => {
		const result = validateTempStaffing({
			assignment: { start_date: "2026-04-01", canton: "ZH", industry: "IT" },
			worker: { nationality: "CH", permit_type: "CH", hourly_rate: 55, employment_percentage: 100 },
			agency: { has_seco_license: false, license_type: "ch_only", has_caution: false },
		});
		expect(result.compliant).toBe(false);
		expect(result.violations.some((v) => v.article === "AVG Art. 12")).toBe(true);
	});
});
