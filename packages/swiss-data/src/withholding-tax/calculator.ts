import Decimal from "decimal.js";
import type { WithholdingTaxInput, WithholdingTaxResult } from "@rappen/shared";
import { roundTo5Rappen, toChf } from "@rappen/shared";
import {
	getTariff,
	getCantonDataMeta,
	listAvailableQstYears,
	getCurrentQstYear,
} from "./tariffs/loader.js";
import type { CompactBracket, CompactTariffSeries } from "./types.js";
import { CANTON_REGISTRY } from "../cantons/index.js";

/**
 * Calculate Swiss withholding tax (Quellensteuer).
 *
 * Algorithm per ESTV spec ("Mindeststeuer in Fr. / Steuer %-Satz"):
 *   tax = max( income * rate, min_tax )
 *
 * The lookup finds the bracket whose `from` is the largest value ≤ income.
 *
 * For 13th salary, the rate-determining income is monthly_gross * 13/12,
 * but the actual tax is applied to the monthly_gross.
 */
export function calculateWithholdingTax(input: WithholdingTaxInput): WithholdingTaxResult {
	const churchMember = input.church !== "keine";
	const cantonData = CANTON_REGISTRY[input.canton];

	// Resolve target year. If the requested year is not available, fall back
	// to the latest available year ≤ the requested year. This allows software
	// integrations to continue working when ESTV publishes a new year while
	// the tariff data has not yet been updated.
	const availableYears = listAvailableQstYears();
	let targetYear = input.year;
	if (!availableYears.includes(targetYear)) {
		const eligible = availableYears.filter((y) => y <= targetYear);
		if (eligible.length === 0) {
			throw new Error(
				`Keine Quellensteuertarife verfügbar für Jahr ${input.year} oder früher. ` +
					`Verfügbar: ${availableYears.join(", ") || "(keine)"}.`,
			);
		}
		targetYear = eligible[eligible.length - 1];
	}

	const series = getTariff(
		input.canton,
		input.tariff_code,
		input.children,
		churchMember,
		targetYear,
	);

	if (!series) {
		throw new Error(
			`Kein Quellensteuertarif gefunden für Kanton ${input.canton}, ` +
				`Tarifcode ${input.tariff_code}, ${input.children} Kind(er), ` +
				`Konfession ${input.church}, Jahr ${targetYear}.`,
		);
	}

	const monthlyGross = new Decimal(input.gross_monthly);

	// 13th salary: rate-determining income is monthly_gross * 13/12
	const lookupIncome = input.thirteenth_salary
		? monthlyGross.mul(13).div(12)
		: monthlyGross;

	const bracket = findBracket(series.b, lookupIncome.toNumber());

	const rate = new Decimal(bracket[1]);
	const minTax = new Decimal(bracket[2]);

	// tax = max( monthly_gross * rate / 100, min_tax )
	const computedTax = monthlyGross.mul(rate).div(100);
	const taxAmount = roundTo5Rappen(Decimal.max(computedTax, minTax));

	const effectiveRate = monthlyGross.gt(0)
		? taxAmount.div(monthlyGross).mul(100)
		: new Decimal(0);

	const meta = getCantonDataMeta(input.canton, targetYear);

	return {
		tax_amount: toChf(taxAmount),
		effective_rate: effectiveRate.toFixed(2) + "%",
		tariff_code_full: buildFullCodeString(series),
		canton: input.canton,
		year: targetYear,
		model: input.canton === "GE" || input.canton === "VD" ? "annual" : "monthly",
		legal_basis: `DBG Art. 83-86, StG ${input.canton}; ESTV-Tariffile ${targetYear} vom ${meta.created_at || "unbekannt"}`,
	};
}

/**
 * Find the bracket whose `from` is the largest value ≤ income.
 * Uses binary search since brackets are sorted ascending.
 */
function findBracket(brackets: CompactBracket[], income: number): CompactBracket {
	if (brackets.length === 0) {
		throw new Error("Empty bracket list");
	}
	if (income < brackets[0][0]) {
		return brackets[0];
	}

	let lo = 0;
	let hi = brackets.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >>> 1;
		if (brackets[mid][0] <= income) {
			lo = mid;
		} else {
			hi = mid - 1;
		}
	}
	return brackets[lo];
}

function buildFullCodeString(series: CompactTariffSeries): string {
	return `${series.g}${series.c}${series.k ? "Y" : "N"}`;
}
