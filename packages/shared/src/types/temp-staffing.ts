import type { CantonCode } from "./common.js";

export interface TempStaffingInput {
	assignment: {
		start_date: string;
		end_date?: string;
		canton: CantonCode;
		industry: string;
		gav_code?: string;
	};
	worker: {
		nationality: string;
		permit_type: "B" | "C" | "G" | "L" | "F" | "N" | "S" | "CH";
		hourly_rate: number;
		employment_percentage: number;
	};
	agency: {
		has_seco_license: boolean;
		license_type?: "ch_only" | "ch_and_abroad";
		has_caution: boolean;
		caution_amount?: number;
	};
}

export interface TempStaffingResult {
	compliant: boolean;
	violations: TempStaffingViolation[];
	gav_applicable?: {
		name: string;
		minimum_hourly_rate: string;
		equal_pay_compliant: boolean;
	};
	max_assignment_duration?: string;
	remaining_duration?: string;
	required_caution: string;
	legal_basis: string[];
}

export interface TempStaffingViolation {
	rule: string;
	article: string;
	severity: "error" | "warning";
	message: string;
}
