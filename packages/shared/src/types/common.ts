/** All 26 Swiss cantons */
export const CANTONS = [
	"AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR",
	"JU", "LU", "NE", "NW", "OW", "SG", "SH", "SO", "SZ", "TG",
	"TI", "UR", "VD", "VS", "ZG", "ZH",
] as const;

export type CantonCode = (typeof CANTONS)[number];

/** Marital status for tax/social insurance calculations */
export type MaritalStatus = "single" | "married" | "divorced" | "widowed";

/** Church affiliation for church tax */
export type ChurchAffiliation = "reformiert" | "katholisch" | "christkatholisch" | "keine";

/** Supported currencies */
export type Currency = "CHF" | "EUR";

/** Supported locales */
export type Locale = "de" | "fr" | "it" | "en";

/** Standard API response wrapper */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: ApiError;
	meta?: {
		calculation_date: string;
		legal_basis: string[];
		canton?: CantonCode;
		year: number;
	};
}

export interface ApiError {
	code: string;
	message: string;
	details?: Record<string, string>;
}

/** Canton display info */
export interface CantonInfo {
	code: CantonCode;
	name_de: string;
	name_fr: string;
	name_it: string;
	name_en: string;
	capital: string;
}
