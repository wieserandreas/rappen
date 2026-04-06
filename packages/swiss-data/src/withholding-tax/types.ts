import type { CantonCode } from "@rappen/shared";
import type { TariffCode } from "@rappen/shared";

/**
 * A single tariff bracket: income range → tax rate.
 * Monthly model: brackets are for monthly income.
 * Annual model (GE, VD): brackets are for annual income.
 */
export interface TariffBracket {
	/** Lower bound of income (inclusive) */
	from: number;
	/** Upper bound of income (exclusive, null = unlimited) */
	to: number | null;
	/** Tax rate in % for this bracket */
	rate: number;
}

/**
 * Complete tariff table for one canton, one tariff code, one year.
 */
export interface CantonTariff {
	canton: CantonCode;
	year: number;
	tariff_code: TariffCode;
	children: number;
	church: boolean;
	model: "monthly" | "annual";
	brackets: TariffBracket[];
}

/**
 * Tariff lookup key: "ZH_A_0_N" = Zürich, Code A, 0 children, no church
 */
export function tariffKey(
	canton: CantonCode,
	code: TariffCode,
	children: number,
	church: boolean,
): string {
	return `${canton}_${code}_${children}_${church ? "Y" : "N"}`;
}
