import { z } from "zod";
import { CANTONS } from "../types/common.js";

export const cantonSchema = z.enum(CANTONS);

export const maritalStatusSchema = z.enum(["single", "married", "divorced", "widowed"]);

export const churchSchema = z.enum(["reformiert", "katholisch", "christkatholisch", "keine"]);

export const localeSchema = z.enum(["de", "fr", "it", "en"]);

export const payrollInputSchema = z.object({
	canton: cantonSchema,
	municipality: z.string().optional(),
	gross_monthly: z.number().positive().max(1_000_000),
	birth_year: z.number().int().min(1930).max(2010),
	marital_status: maritalStatusSchema,
	children: z.number().int().min(0).max(20),
	children_ages: z.array(z.number().int().min(0).max(30)).optional(),
	church: churchSchema,
	withholding_tax: z.boolean(),
	bvg_plan: z.enum(["minimum", "standard", "custom"]),
	bvg_custom_rate: z.number().min(0).max(50).optional(),
	uvg_nbu_rate: z.number().min(0).max(15),
	ktg_rate: z.number().min(0).max(10).optional(),
	employment_percentage: z.number().min(10).max(100),
	thirteenth_salary: z.boolean(),
	bonus: z.number().min(0).optional(),
	additional_income: z.number().min(0).optional(),
	correction_month: z.string().optional(),
});

export const withholdingTaxInputSchema = z.object({
	canton: cantonSchema,
	year: z.number().int().min(2024).max(2030),
	tariff_code: z.enum(["A", "B", "C", "D", "E", "F", "G", "H"]),
	children: z.number().int().min(0).max(9),
	church: churchSchema,
	gross_monthly: z.number().positive().max(1_000_000),
	thirteenth_salary: z.boolean(),
});

export const qrBillAddressSchema = z.object({
	name: z.string().min(1).max(70),
	street: z.string().max(70),
	building_number: z.string().max(16).optional(),
	postal_code: z.string().min(1).max(16),
	city: z.string().min(1).max(35),
	country: z.string().length(2),
});

export const qrBillInputSchema = z.object({
	creditor: qrBillAddressSchema,
	debtor: qrBillAddressSchema.optional(),
	amount: z.number().positive().max(999_999_999.99).optional(),
	currency: z.enum(["CHF", "EUR"]),
	reference_type: z.enum(["QRR", "SCOR", "NON"]),
	reference: z.string().optional(),
	iban: z.string().min(21).max(21),
	additional_info: z.string().max(140).optional(),
	language: localeSchema,
});

export const vatTransactionSchema = z.object({
	description: z.string(),
	amount: z.number(),
	rate_type: z.enum(["normal", "reduced", "accommodation", "exempt"]),
	is_import: z.boolean().optional(),
	is_export: z.boolean().optional(),
	country_code: z.string().length(2).optional(),
});

export const vatCalculationInputSchema = z.object({
	transactions: z.array(vatTransactionSchema).min(1),
	method: z.enum(["effective", "saldo", "pauschal"]),
	saldo_rate_code: z.string().optional(),
	period: z.object({ from: z.string(), to: z.string() }),
	include_reverse_charge: z.boolean(),
});
