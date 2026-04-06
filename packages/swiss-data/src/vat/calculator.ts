import Decimal from "decimal.js";
import type { VatCalculationInput, VatCalculationResult, VatBreakdownLine, VatRateType } from "@rappen/shared";
import { roundTo5Rappen, toChf } from "@rappen/shared";
import { VAT_RATES_2026 } from "./rates.js";
import { getSaldoRate } from "./saldo-rates.js";

/**
 * Swiss VAT (MWST) calculation engine.
 *
 * Supports:
 * - Effective method: track input/output VAT per transaction
 * - Saldo method: apply flat industry rate to revenue
 * - Reverse charge (Bezugsteuer) for foreign services >10k/year
 */
export function calculateVat(input: VatCalculationInput): VatCalculationResult {
	if (input.method === "saldo") {
		return calculateSaldo(input);
	}

	return calculateEffective(input);
}

function calculateEffective(input: VatCalculationInput): VatCalculationResult {
	const breakdown: VatBreakdownLine[] = [];
	let totalRevenue = new Decimal(0);
	let totalVatCollected = new Decimal(0);
	let totalInputVat = new Decimal(0);
	let reverseCharge = new Decimal(0);

	const tips: string[] = [];

	// Group transactions by rate type
	const groups = new Map<VatRateType, { taxable: Decimal; vat: Decimal }>();

	for (const tx of input.transactions) {
		const amount = new Decimal(tx.amount);

		if (tx.rate_type === "exempt") {
			totalRevenue = totalRevenue.add(amount);
			if (!groups.has("exempt")) groups.set("exempt", { taxable: new Decimal(0), vat: new Decimal(0) });
			const g = groups.get("exempt")!;
			g.taxable = g.taxable.add(amount);
			continue;
		}

		// Export: 0% VAT
		if (tx.is_export) {
			totalRevenue = totalRevenue.add(amount);
			tips.push(`Export-Umsatz CHF ${toChf(amount)} ist von der MWST befreit (Art. 23 MWSTG).`);
			continue;
		}

		// Import / Reverse charge
		if (tx.is_import && input.include_reverse_charge) {
			const rcAmount = amount.mul(VAT_RATES_2026.normal).div(100);
			reverseCharge = reverseCharge.add(rcAmount);
			continue;
		}

		const rate = getRate(tx.rate_type);
		const vatAmount = roundTo5Rappen(amount.mul(rate).div(100));

		totalRevenue = totalRevenue.add(amount);
		totalVatCollected = totalVatCollected.add(vatAmount);

		if (!groups.has(tx.rate_type)) {
			groups.set(tx.rate_type, { taxable: new Decimal(0), vat: new Decimal(0) });
		}
		const g = groups.get(tx.rate_type)!;
		g.taxable = g.taxable.add(amount);
		g.vat = g.vat.add(vatAmount);
	}

	// Build breakdown
	for (const [rateType, group] of groups) {
		breakdown.push({
			rate_type: rateType,
			rate: rateType === "exempt" ? "0.00%" : getRate(rateType).toString() + "%",
			taxable_amount: toChf(group.taxable),
			vat_amount: toChf(group.vat),
		});
	}

	const vatPayable = roundTo5Rappen(totalVatCollected.sub(totalInputVat).add(reverseCharge));

	// Optimization tips
	if (totalRevenue.lte(VAT_RATES_2026.registration_threshold)) {
		tips.push(
			`Ihr Umsatz liegt unter CHF ${toChf(VAT_RATES_2026.registration_threshold)}. ` +
			`Freiwillige Unterstellung kann vorteilhaft sein, wenn Sie hohe Vorsteuer haben.`
		);
	}

	if (totalRevenue.gt(0) && totalRevenue.lte(new Decimal("5005000"))) {
		tips.push(
			"Prüfen Sie, ob die Saldosteuersatz-Methode für Ihre Branche günstiger wäre. " +
			"Diese ist bis CHF 5'005'000 Umsatz und CHF 103'000 Steuerschuld zulässig."
		);
	}

	return {
		total_revenue: toChf(totalRevenue),
		total_vat_collected: toChf(totalVatCollected),
		total_input_vat: toChf(totalInputVat),
		vat_payable: toChf(vatPayable),
		reverse_charge: reverseCharge.gt(0) ? toChf(reverseCharge) : undefined,
		optimization_tips: tips,
		breakdown,
		legal_basis: ["MWSTG Art. 25 (Steuersätze)", "MWSTG Art. 28 (Vorsteuerabzug)", "MWSTG Art. 45 (Bezugsteuer)"],
	};
}

function calculateSaldo(input: VatCalculationInput): VatCalculationResult {
	if (!input.saldo_rate_code) {
		throw new Error("Saldosteuersatz-Code erforderlich für Saldo-Methode.");
	}

	const saldoRate = getSaldoRate(input.saldo_rate_code);
	if (!saldoRate) {
		throw new Error(`Unbekannter Saldosteuersatz-Code: ${input.saldo_rate_code}`);
	}

	let totalRevenue = new Decimal(0);
	for (const tx of input.transactions) {
		totalRevenue = totalRevenue.add(new Decimal(tx.amount));
	}

	// Saldo method: tax = revenue * saldo rate / 100
	// Revenue is GROSS (inkl. MWST), so the formula is:
	// Tax = Gross Revenue * Saldo Rate / 100
	const vatPayable = roundTo5Rappen(totalRevenue.mul(saldoRate.rate).div(100));

	return {
		total_revenue: toChf(totalRevenue),
		total_vat_collected: toChf(vatPayable),
		total_input_vat: "0.00", // No input VAT deduction with Saldo method
		vat_payable: toChf(vatPayable),
		optimization_tips: [
			`Saldosteuersatz ${saldoRate.rate}% (${saldoRate.description_de}) angewendet.`,
			"Bei der Saldo-Methode entfällt der Vorsteuerabzug.",
		],
		breakdown: [{
			rate_type: "normal",
			rate: saldoRate.rate.toString() + "%",
			taxable_amount: toChf(totalRevenue),
			vat_amount: toChf(vatPayable),
		}],
		legal_basis: ["MWSTG Art. 37 (Saldosteuersatz-Methode)"],
	};
}

function getRate(rateType: VatRateType): Decimal {
	switch (rateType) {
		case "normal": return VAT_RATES_2026.normal;
		case "reduced": return VAT_RATES_2026.reduced;
		case "accommodation": return VAT_RATES_2026.accommodation;
		case "exempt": return new Decimal(0);
	}
}
