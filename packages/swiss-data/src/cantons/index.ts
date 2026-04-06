import Decimal from "decimal.js";
import type { CantonCode } from "@rappen/shared";
import type { CantonData } from "./types.js";

/**
 * Complete registry of all 26 Swiss cantons.
 * [VERIFY] qst_model for GE and VD (should be "annual")
 */
export const CANTON_REGISTRY: Record<CantonCode, CantonData> = {
	AG: { code: "AG", name_de: "Aargau", name_fr: "Argovie", name_it: "Argovia", name_en: "Aargau", capital: "Aarau", fak_rate: new Decimal("1.3"), has_church_tax: true, qst_model: "monthly" },
	AI: { code: "AI", name_de: "Appenzell Innerrhoden", name_fr: "Appenzell Rhodes-Intérieures", name_it: "Appenzello Interno", name_en: "Appenzell Innerrhoden", capital: "Appenzell", fak_rate: new Decimal("1.5"), has_church_tax: true, qst_model: "monthly" },
	AR: { code: "AR", name_de: "Appenzell Ausserrhoden", name_fr: "Appenzell Rhodes-Extérieures", name_it: "Appenzello Esterno", name_en: "Appenzell Ausserrhoden", capital: "Herisau", fak_rate: new Decimal("1.5"), has_church_tax: true, qst_model: "monthly" },
	BE: { code: "BE", name_de: "Bern", name_fr: "Berne", name_it: "Berna", name_en: "Bern", capital: "Bern", fak_rate: new Decimal("1.6"), has_church_tax: true, qst_model: "monthly" },
	BL: { code: "BL", name_de: "Basel-Landschaft", name_fr: "Bâle-Campagne", name_it: "Basilea Campagna", name_en: "Basel-Landschaft", capital: "Liestal", fak_rate: new Decimal("1.6"), has_church_tax: true, qst_model: "monthly" },
	BS: { code: "BS", name_de: "Basel-Stadt", name_fr: "Bâle-Ville", name_it: "Basilea Città", name_en: "Basel-Stadt", capital: "Basel", fak_rate: new Decimal("1.2"), has_church_tax: true, qst_model: "monthly" },
	FR: { code: "FR", name_de: "Freiburg", name_fr: "Fribourg", name_it: "Friburgo", name_en: "Fribourg", capital: "Freiburg", fak_rate: new Decimal("2.3"), has_church_tax: true, qst_model: "monthly" },
	GE: { code: "GE", name_de: "Genf", name_fr: "Genève", name_it: "Ginevra", name_en: "Geneva", capital: "Genf", fak_rate: new Decimal("2.45"), has_church_tax: false, qst_model: "annual" },
	GL: { code: "GL", name_de: "Glarus", name_fr: "Glaris", name_it: "Glarona", name_en: "Glarus", capital: "Glarus", fak_rate: new Decimal("1.3"), has_church_tax: true, qst_model: "monthly" },
	GR: { code: "GR", name_de: "Graubünden", name_fr: "Grisons", name_it: "Grigioni", name_en: "Graubünden", capital: "Chur", fak_rate: new Decimal("1.6"), has_church_tax: true, qst_model: "monthly" },
	JU: { code: "JU", name_de: "Jura", name_fr: "Jura", name_it: "Giura", name_en: "Jura", capital: "Delémont", fak_rate: new Decimal("2.7"), has_church_tax: true, qst_model: "monthly" },
	LU: { code: "LU", name_de: "Luzern", name_fr: "Lucerne", name_it: "Lucerna", name_en: "Lucerne", capital: "Luzern", fak_rate: new Decimal("1.7"), has_church_tax: true, qst_model: "monthly" },
	NE: { code: "NE", name_de: "Neuenburg", name_fr: "Neuchâtel", name_it: "Neuchâtel", name_en: "Neuchâtel", capital: "Neuenburg", fak_rate: new Decimal("2.5"), has_church_tax: true, qst_model: "monthly" },
	NW: { code: "NW", name_de: "Nidwalden", name_fr: "Nidwald", name_it: "Nidvaldo", name_en: "Nidwalden", capital: "Stans", fak_rate: new Decimal("1.3"), has_church_tax: true, qst_model: "monthly" },
	OW: { code: "OW", name_de: "Obwalden", name_fr: "Obwald", name_it: "Obvaldo", name_en: "Obwalden", capital: "Sarnen", fak_rate: new Decimal("1.3"), has_church_tax: true, qst_model: "monthly" },
	SG: { code: "SG", name_de: "St. Gallen", name_fr: "Saint-Gall", name_it: "San Gallo", name_en: "St. Gallen", capital: "St. Gallen", fak_rate: new Decimal("1.6"), has_church_tax: true, qst_model: "monthly" },
	SH: { code: "SH", name_de: "Schaffhausen", name_fr: "Schaffhouse", name_it: "Sciaffusa", name_en: "Schaffhausen", capital: "Schaffhausen", fak_rate: new Decimal("1.3"), has_church_tax: true, qst_model: "monthly" },
	SO: { code: "SO", name_de: "Solothurn", name_fr: "Soleure", name_it: "Soletta", name_en: "Solothurn", capital: "Solothurn", fak_rate: new Decimal("1.7"), has_church_tax: true, qst_model: "monthly" },
	SZ: { code: "SZ", name_de: "Schwyz", name_fr: "Schwytz", name_it: "Svitto", name_en: "Schwyz", capital: "Schwyz", fak_rate: new Decimal("1.6"), has_church_tax: true, qst_model: "monthly" },
	TG: { code: "TG", name_de: "Thurgau", name_fr: "Thurgovie", name_it: "Turgovia", name_en: "Thurgau", capital: "Frauenfeld", fak_rate: new Decimal("1.4"), has_church_tax: true, qst_model: "monthly" },
	TI: { code: "TI", name_de: "Tessin", name_fr: "Tessin", name_it: "Ticino", name_en: "Ticino", capital: "Bellinzona", fak_rate: new Decimal("1.5"), has_church_tax: true, qst_model: "monthly" },
	UR: { code: "UR", name_de: "Uri", name_fr: "Uri", name_it: "Uri", name_en: "Uri", capital: "Altdorf", fak_rate: new Decimal("1.5"), has_church_tax: true, qst_model: "monthly" },
	VD: { code: "VD", name_de: "Waadt", name_fr: "Vaud", name_it: "Vaud", name_en: "Vaud", capital: "Lausanne", fak_rate: new Decimal("2.8"), has_church_tax: true, qst_model: "annual" },
	VS: { code: "VS", name_de: "Wallis", name_fr: "Valais", name_it: "Vallese", name_en: "Valais", capital: "Sitten", fak_rate: new Decimal("2.9"), has_church_tax: true, qst_model: "monthly" },
	ZG: { code: "ZG", name_de: "Zug", name_fr: "Zoug", name_it: "Zugo", name_en: "Zug", capital: "Zug", fak_rate: new Decimal("1.1"), has_church_tax: true, qst_model: "monthly" },
	ZH: { code: "ZH", name_de: "Zürich", name_fr: "Zurich", name_it: "Zurigo", name_en: "Zurich", capital: "Zürich", fak_rate: new Decimal("1.2"), has_church_tax: true, qst_model: "monthly" },
};

export function getCantonData(code: CantonCode): CantonData {
	return CANTON_REGISTRY[code];
}
