import type { CantonCode, TariffCode } from "@rappen/shared";
import type { CantonTariff } from "../types.js";
import { tariffKey } from "../types.js";

// Import all canton tariffs
import { ZH_TARIFFS_2026 } from "./2026/ZH.js";

/**
 * Tariff registry: maps tariff keys to tariff data.
 * Built at import time from all canton files.
 */
const TARIFF_REGISTRY = new Map<string, CantonTariff>();

function registerTariffs(tariffs: CantonTariff[]) {
	for (const t of tariffs) {
		const key = tariffKey(t.canton, t.tariff_code, t.children, t.church);
		TARIFF_REGISTRY.set(key, t);
	}
}

// Register all available tariffs
registerTariffs(ZH_TARIFFS_2026);

// [VERIFY] Add remaining 25 cantons as tariff data becomes available:
// registerTariffs(BE_TARIFFS_2026);
// registerTariffs(LU_TARIFFS_2026);
// ... etc.

/**
 * Look up a tariff by canton, code, children, and church membership.
 * Returns null if no tariff data is available for this combination.
 */
export function getTariff(
	canton: CantonCode,
	code: TariffCode,
	children: number,
	church: boolean,
	year: number = 2026,
): CantonTariff | null {
	const key = tariffKey(canton, code, children, church);
	return TARIFF_REGISTRY.get(key) ?? null;
}

/**
 * Get all available tariff keys (for validation/debugging).
 */
export function getAvailableTariffs(): string[] {
	return Array.from(TARIFF_REGISTRY.keys());
}
