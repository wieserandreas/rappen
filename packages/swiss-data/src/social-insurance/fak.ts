import Decimal from "decimal.js";
import type { CantonCode } from "@rappen/shared";

/**
 * FAK (Familienausgleichskasse) – Child allowances per canton for 2026.
 * Source: Individual cantonal FAK websites and BSV
 * [VERIFY] ALL values must be verified against 2026 cantonal publications.
 * Each canton sets its own rates independently.
 */
export interface FakRates {
	/** Monthly child allowance (Kinderzulage) in CHF */
	child_allowance: Decimal;
	/** Monthly education allowance (Ausbildungszulage, from age 16) in CHF */
	education_allowance: Decimal;
	/** FAK employer contribution rate in % of AHV salary */
	employer_rate: Decimal;
	/** Source URL for verification */
	source: string;
}

export const FAK_2026: Record<CantonCode, FakRates> = {
	AG: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.3"), source: "svazurich.ch" },
	AI: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.5"), source: "svai.ch" },
	AR: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.5"), source: "svar.ch" },
	BE: { child_allowance: new Decimal("230"), education_allowance: new Decimal("290"), employer_rate: new Decimal("1.6"), source: "akbern.ch" },
	BL: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.6"), source: "akbl.ch" },
	BS: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.2"), source: "akbs.ch" },
	FR: { child_allowance: new Decimal("245"), education_allowance: new Decimal("305"), employer_rate: new Decimal("2.3"), source: "caisseavsfr.ch" },
	GE: { child_allowance: new Decimal("311"), education_allowance: new Decimal("415"), employer_rate: new Decimal("2.45"), source: "ocas.ch" },
	GL: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.3"), source: "svgl.ch" },
	GR: { child_allowance: new Decimal("220"), education_allowance: new Decimal("270"), employer_rate: new Decimal("1.6"), source: "svagr.ch" },
	JU: { child_allowance: new Decimal("275"), education_allowance: new Decimal("325"), employer_rate: new Decimal("2.7"), source: "caisseavsjura.ch" },
	LU: { child_allowance: new Decimal("210"), education_allowance: new Decimal("260"), employer_rate: new Decimal("1.7"), source: "aklu.ch" },
	NE: { child_allowance: new Decimal("220"), education_allowance: new Decimal("300"), employer_rate: new Decimal("2.5"), source: "caisseavsne.ch" },
	NW: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.3"), source: "nwak.ch" },
	OW: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.3"), source: "akow.ch" },
	SG: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.6"), source: "svasg.ch" },
	SH: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.3"), source: "svash.ch" },
	SO: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.7"), source: "akso.ch" },
	SZ: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.6"), source: "aksz.ch" },
	TG: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.4"), source: "svtg.ch" },
	TI: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.5"), source: "iasti.ch" },
	UR: { child_allowance: new Decimal("210"), education_allowance: new Decimal("260"), employer_rate: new Decimal("1.5"), source: "akur.ch" },
	VD: { child_allowance: new Decimal("300"), education_allowance: new Decimal("400"), employer_rate: new Decimal("2.8"), source: "caisseavsvaud.ch" },
	VS: { child_allowance: new Decimal("375"), education_allowance: new Decimal("475"), employer_rate: new Decimal("2.9"), source: "caisseavsvs.ch" },
	ZG: { child_allowance: new Decimal("300"), education_allowance: new Decimal("350"), employer_rate: new Decimal("1.1"), source: "akzug.ch" },
	ZH: { child_allowance: new Decimal("200"), education_allowance: new Decimal("250"), employer_rate: new Decimal("1.2"), source: "svazurich.ch" },
};
