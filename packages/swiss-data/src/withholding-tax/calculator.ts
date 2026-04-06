import Decimal from "decimal.js";
import type { WithholdingTaxInput, WithholdingTaxResult } from "@rappen/shared";
import { roundTo5Rappen, toChf } from "@rappen/shared";
import { getTariff } from "./tariffs/loader.js";
import { buildTariffCodeString } from "./tariff-codes.js";
import type { TariffBracket } from "./types.js";
import { CANTON_REGISTRY } from "../cantons/index.js";

/**
 * Calculate Swiss withholding tax (Quellensteuer) for a given input.
 *
 * The calculation uses the effective rate method: look up the bracket
 * that matches the gross monthly income, then apply that rate to the
 * full income (not marginal/progressive).
 *
 * This is how Swiss withholding tax works: the published tariff tables
 * give an EFFECTIVE rate per income bracket, not marginal rates.
 */
export function calculateWithholdingTax(input: WithholdingTaxInput): WithholdingTaxResult {
	const churchMember = input.church !== "keine";
	const cantonData = CANTON_REGISTRY[input.canton];

	// Look up tariff
	const tariff = getTariff(input.canton, input.tariff_code, input.children, churchMember, input.year);

	if (!tariff) {
		throw new Error(
			`Keine Quellensteuertarife verfügbar für ${input.canton}, ` +
			`Tarif ${buildTariffCodeString(input.tariff_code, input.children, churchMember)}, ` +
			`Jahr ${input.year}. Verfügbare Kantone: ZH (weitere folgen).`
		);
	}

	// Determine gross for lookup
	let lookupGross = new Decimal(input.gross_monthly);

	// For 13th salary: annualize, find rate, then apply to monthly
	// The 13th salary raises the annual income → higher effective rate
	if (input.thirteenth_salary && tariff.model === "monthly") {
		// Method: Multiply monthly by 13/12 to get effective monthly for rate lookup
		lookupGross = lookupGross.mul(13).div(12);
	}

	// Find matching bracket
	const bracket = findBracket(tariff.brackets, lookupGross.toNumber());
	const rate = new Decimal(bracket.rate);

	// Apply rate to actual monthly gross (not the adjusted one)
	const monthlyGross = new Decimal(input.gross_monthly);
	const taxAmount = roundTo5Rappen(monthlyGross.mul(rate).div(100));

	const effectiveRate = monthlyGross.gt(0)
		? taxAmount.div(monthlyGross).mul(100)
		: new Decimal(0);

	return {
		tax_amount: toChf(taxAmount),
		effective_rate: effectiveRate.toFixed(2) + "%",
		tariff_code_full: buildTariffCodeString(input.tariff_code, input.children, churchMember),
		canton: input.canton,
		year: input.year,
		model: tariff.model,
		legal_basis: `DBG Art. 83ff, StG ${input.canton}`,
	};
}

/**
 * Find the bracket that applies to a given gross income.
 * Brackets are sorted by `from` ascending. We find the last bracket
 * where `from <= gross`.
 */
function findBracket(brackets: TariffBracket[], gross: number): TariffBracket {
	let matched = brackets[0];
	for (const bracket of brackets) {
		if (gross >= bracket.from) {
			matched = bracket;
		} else {
			break;
		}
	}
	return matched;
}
