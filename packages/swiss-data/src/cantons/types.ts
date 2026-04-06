import type Decimal from "decimal.js";
import type { CantonCode } from "@rappen/shared";

export interface CantonData {
	code: CantonCode;
	name_de: string;
	name_fr: string;
	name_it: string;
	name_en: string;
	capital: string;
	/** FAK employer rate in % of AHV salary */
	fak_rate: Decimal;
	/** Church tax applicable */
	has_church_tax: boolean;
	/** Withholding tax model: monthly or annual */
	qst_model: "monthly" | "annual";
}
