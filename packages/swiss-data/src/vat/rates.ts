import Decimal from "decimal.js";

/**
 * MWST/TVA/IVA rates for 2026.
 * Source: ESTV – Mehrwertsteuersätze
 * [VERIFY] Confirm these are still valid for 2026
 */
export const VAT_RATES_2026 = {
	year: 2026,

	/** Normalsatz (Art. 25 Abs. 1 MWSTG) */
	normal: new Decimal("8.1"),

	/** Reduzierter Satz (Art. 25 Abs. 2 MWSTG) – Lebensmittel, Medikamente, Zeitungen, etc. */
	reduced: new Decimal("2.6"),

	/** Beherbergungssatz (Art. 25 Abs. 4 MWSTG) */
	accommodation: new Decimal("3.8"),

	/** Bezugsteuer-Schwelle für Dienstleistungen aus dem Ausland (Art. 45 MWSTG) */
	reverse_charge_threshold: new Decimal("10000"),

	/** Obligatorische Steuerpflicht ab Jahresumsatz (Art. 10 MWSTG) */
	registration_threshold: new Decimal("100000"),

	legal_basis: "MWSTG Art. 25",
} as const;
