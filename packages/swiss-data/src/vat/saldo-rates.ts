import Decimal from "decimal.js";

/**
 * MWST Saldosteuersätze (flat-rate tax method) by industry.
 * Source: ESTV – Liste der bewilligten Saldosteuersätze
 * [VERIFY] Confirm these rates are current for 2026
 *
 * The Saldo method simplifies VAT reporting: instead of tracking input VAT,
 * businesses apply a single industry-specific rate to their revenue.
 */
export interface SaldoRate {
	code: string;
	description_de: string;
	rate: Decimal;
}

export const SALDO_RATES_2026: SaldoRate[] = [
	{ code: "01", description_de: "Lebensmittelhandel (Detailhandel)", rate: new Decimal("0.1") },
	{ code: "02", description_de: "Milchwirtschaft", rate: new Decimal("0.6") },
	{ code: "03", description_de: "Getränkehandel", rate: new Decimal("1.2") },
	{ code: "04", description_de: "Landwirtschaft, Gartenbau", rate: new Decimal("0.6") },
	{ code: "05", description_de: "Bäckereien, Konditoreien", rate: new Decimal("1.3") },
	{ code: "06", description_de: "Metzgereien", rate: new Decimal("0.6") },
	{ code: "07", description_de: "Gastgewerbe (Beherbergung)", rate: new Decimal("3.5") },
	{ code: "08", description_de: "Gastgewerbe (Restauration)", rate: new Decimal("5.1") },
	{ code: "09", description_de: "Detailhandel Non-Food", rate: new Decimal("2.8") },
	{ code: "10", description_de: "Bauhauptgewerbe", rate: new Decimal("5.9") },
	{ code: "11", description_de: "Baunebengewerbe (Maler, Gipser, etc.)", rate: new Decimal("5.9") },
	{ code: "12", description_de: "Elektroinstallationen", rate: new Decimal("5.9") },
	{ code: "13", description_de: "Sanitär, Heizung, Klima", rate: new Decimal("5.9") },
	{ code: "14", description_de: "Schreinereien, Holzbau", rate: new Decimal("4.4") },
	{ code: "15", description_de: "Metallbau, Schlossereien", rate: new Decimal("5.1") },
	{ code: "16", description_de: "Autogewerbe (Handel + Reparatur)", rate: new Decimal("3.5") },
	{ code: "17", description_de: "Transportunternehmen", rate: new Decimal("5.9") },
	{ code: "18", description_de: "Reinigungsunternehmen", rate: new Decimal("6.4") },
	{ code: "19", description_de: "Coiffeure, Kosmetik", rate: new Decimal("6.4") },
	{ code: "20", description_de: "Informatik, Beratung", rate: new Decimal("6.4") },
	{ code: "21", description_de: "Architektur, Ingenieurwesen", rate: new Decimal("6.1") },
	{ code: "22", description_de: "Rechtsberatung, Treuhand", rate: new Decimal("6.4") },
	{ code: "23", description_de: "Werbung, Kommunikation", rate: new Decimal("6.1") },
	{ code: "24", description_de: "Druckereien", rate: new Decimal("3.5") },
	{ code: "25", description_de: "Vermietung von Gütern", rate: new Decimal("6.4") },
];

/**
 * Look up Saldo rate by code.
 */
export function getSaldoRate(code: string): SaldoRate | undefined {
	return SALDO_RATES_2026.find((r) => r.code === code);
}
