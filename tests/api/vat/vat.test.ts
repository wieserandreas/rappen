import { describe, it, expect } from "vitest";
import { calculateVat } from "@rappen/swiss-data";
import { VAT_RATES_2026, getSaldoRate } from "@rappen/swiss-data";
import type { VatCalculationInput } from "@rappen/shared";

function makeInput(overrides: Partial<VatCalculationInput> = {}): VatCalculationInput {
	return {
		transactions: [
			{ description: "Beratung", amount: 10000, rate_type: "normal" },
		],
		method: "effective",
		period: { from: "2026-01-01", to: "2026-03-31" },
		include_reverse_charge: false,
		...overrides,
	};
}

// ════════════════════════════════════════════════════════════
// VAT Rate Constants
// ════════════════════════════════════════════════════════════
describe("VAT – Rate Constants 2026", () => {
	it("should have correct standard rates", () => {
		expect(VAT_RATES_2026.normal.toString()).toBe("8.1");
		expect(VAT_RATES_2026.reduced.toString()).toBe("2.6");
		expect(VAT_RATES_2026.accommodation.toString()).toBe("3.8");
	});

	it("should have correct thresholds", () => {
		expect(VAT_RATES_2026.reverse_charge_threshold.toString()).toBe("10000");
		expect(VAT_RATES_2026.registration_threshold.toString()).toBe("100000");
	});
});

// ════════════════════════════════════════════════════════════
// Effective Method
// ════════════════════════════════════════════════════════════
describe("VAT – Effective Method", () => {
	it("should calculate normal rate correctly", () => {
		const result = calculateVat(makeInput());
		// 10000 * 8.1% = 810.00
		expect(result.total_revenue).toBe("10000.00");
		expect(result.total_vat_collected).toBe("810.00");
		expect(result.vat_payable).toBe("810.00");
	});

	it("should calculate reduced rate correctly", () => {
		const result = calculateVat(makeInput({
			transactions: [
				{ description: "Lebensmittel", amount: 5000, rate_type: "reduced" },
			],
		}));
		// 5000 * 2.6% = 130.00
		expect(result.total_vat_collected).toBe("130.00");
	});

	it("should calculate accommodation rate correctly", () => {
		const result = calculateVat(makeInput({
			transactions: [
				{ description: "Hotelübernachtung", amount: 200, rate_type: "accommodation" },
			],
		}));
		// 200 * 3.8% = 7.60
		expect(result.total_vat_collected).toBe("7.60");
	});

	it("should handle exempt transactions (0% VAT)", () => {
		const result = calculateVat(makeInput({
			transactions: [
				{ description: "Arztbesuch", amount: 500, rate_type: "exempt" },
			],
		}));
		expect(result.total_revenue).toBe("500.00");
		expect(result.total_vat_collected).toBe("0.00");
	});

	it("should handle mixed rate types", () => {
		const result = calculateVat(makeInput({
			transactions: [
				{ description: "Beratung", amount: 10000, rate_type: "normal" },
				{ description: "Buch", amount: 50, rate_type: "reduced" },
				{ description: "Hotel", amount: 300, rate_type: "accommodation" },
			],
		}));
		// 10000*8.1% + 50*2.6% + 300*3.8% = 810 + 1.30 + 11.40 = 822.70
		expect(result.total_revenue).toBe("10350.00");
		expect(result.total_vat_collected).toBe("822.70");
		expect(result.breakdown).toHaveLength(3);
	});

	it("should handle export (0% VAT)", () => {
		const result = calculateVat(makeInput({
			transactions: [
				{ description: "Export-Lieferung", amount: 5000, rate_type: "normal", is_export: true },
			],
		}));
		expect(result.total_revenue).toBe("5000.00");
		expect(result.total_vat_collected).toBe("0.00");
		expect(result.optimization_tips.some(t => t.includes("Export"))).toBe(true);
	});

	it("should calculate reverse charge for imports", () => {
		const result = calculateVat(makeInput({
			transactions: [
				{ description: "Software-Lizenz Ausland", amount: 15000, rate_type: "normal", is_import: true },
			],
			include_reverse_charge: true,
		}));
		// 15000 * 8.1% = 1215.00 reverse charge
		expect(result.reverse_charge).toBe("1215.00");
	});

	it("should provide optimization tips for small businesses", () => {
		const result = calculateVat(makeInput({
			transactions: [
				{ description: "Umsatz", amount: 80000, rate_type: "normal" },
			],
		}));
		expect(result.optimization_tips.some(t => t.includes("100"))).toBe(true);
	});

	it("should apply 5-Rappen rounding", () => {
		const result = calculateVat(makeInput({
			transactions: [
				{ description: "Artikel", amount: 123.45, rate_type: "normal" },
			],
		}));
		// 123.45 * 8.1% = 9.99945 → rounded to 5 Rappen = 10.00
		expect(result.total_vat_collected).toBe("10.00");
	});
});

// ════════════════════════════════════════════════════════════
// Saldo Method
// ════════════════════════════════════════════════════════════
describe("VAT – Saldo Method", () => {
	it("should calculate with Saldo rate", () => {
		const result = calculateVat(makeInput({
			method: "saldo",
			saldo_rate_code: "20", // Informatik: 6.4%
			transactions: [
				{ description: "IT-Beratung", amount: 100000, rate_type: "normal" },
			],
		}));
		// 100000 * 6.4% = 6400.00
		expect(result.vat_payable).toBe("6400.00");
		expect(result.total_input_vat).toBe("0.00"); // No input VAT deduction
	});

	it("should throw for missing Saldo code", () => {
		expect(() => calculateVat(makeInput({ method: "saldo" }))).toThrow(/Saldosteuersatz-Code/);
	});

	it("should throw for invalid Saldo code", () => {
		expect(() => calculateVat(makeInput({
			method: "saldo",
			saldo_rate_code: "99",
		}))).toThrow(/Unbekannter/);
	});
});

// ════════════════════════════════════════════════════════════
// Saldo Rates Registry
// ════════════════════════════════════════════════════════════
describe("VAT – Saldo Rates", () => {
	it("should have Informatik at 6.4%", () => {
		const rate = getSaldoRate("20");
		expect(rate).toBeDefined();
		expect(rate!.rate.toString()).toBe("6.4");
	});

	it("should have Gastgewerbe Restauration at 5.1%", () => {
		const rate = getSaldoRate("08");
		expect(rate).toBeDefined();
		expect(rate!.rate.toString()).toBe("5.1");
	});

	it("should return undefined for unknown code", () => {
		expect(getSaldoRate("99")).toBeUndefined();
	});
});
