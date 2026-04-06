export interface PayEquityInput {
	employees: PayEquityEmployee[];
	company_name: string;
	analysis_date: string;
}

export interface PayEquityEmployee {
	id: string;
	gender: "M" | "F";
	salary_monthly: number;
	education_level: 1 | 2 | 3 | 4 | 5;
	potential_experience_years: number;
	service_years: number;
	skill_level: 1 | 2 | 3 | 4;
	professional_position: 1 | 2 | 3 | 4 | 5;
	employment_percentage: number;
}

export interface PayEquityResult {
	compliant: boolean;
	gender_coefficient: string;
	tolerance_threshold: string;
	t_statistic: string;
	p_value: string;
	sample_size: number;
	unexplained_gap_percent: string;
	regression_details: {
		r_squared: string;
		coefficients: Record<string, string>;
	};
	recommendation: string;
	legal_basis: string[];
}
