export interface CompanyRiskInput {
	uid?: string;
	company_name?: string;
}

export interface CompanyRiskResult {
	company: {
		uid: string;
		name: string;
		legal_form: string;
		domicile: string;
		capital: string;
		status: string;
		founding_date: string;
	};
	risk_score: number;
	risk_level: "low" | "medium" | "elevated" | "high";
	signals: RiskSignal[];
	board_members: BoardMember[];
	shab_publications: ShabPublication[];
	industry_comparison?: {
		average_score: number;
		percentile: number;
	};
}

export interface RiskSignal {
	type: string;
	severity: "info" | "warning" | "critical";
	date: string;
	description: string;
	impact_points: number;
}

export interface BoardMember {
	name: string;
	role: string;
	since: string;
	signature_type: string;
}

export interface ShabPublication {
	date: string;
	type: string;
	message: string;
	shab_id: string;
}
