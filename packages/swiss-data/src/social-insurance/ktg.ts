/**
 * KTG (Krankentaggeldversicherung) – optional, not legally required.
 * Most employers offer it. If present, rate is typically shared or employer-paid.
 * Typical rates: 0.5% – 3% of insured salary.
 * No federal standard rates – varies by insurance provider and plan.
 */
export const KTG_INFO = {
	mandatory: false,
	typical_rate_range: { min: 0.5, max: 3.0 },
	legal_basis: "VVG (optional), OR Art. 324a (Lohnfortzahlungspflicht)",
} as const;
