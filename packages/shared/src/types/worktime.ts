export interface WorktimeValidationInput {
	entries: WorktimeEntry[];
	employee: {
		age: number;
		industry: "industrial" | "office" | "retail" | "healthcare" | "gastro" | "other";
		has_night_permit: boolean;
		has_sunday_permit: boolean;
	};
	year: number;
}

export interface WorktimeEntry {
	date: string;
	start: string;
	end: string;
	break_minutes: number;
	type: "regular" | "overtime" | "night" | "sunday" | "holiday";
}

export interface WorktimeValidationResult {
	compliant: boolean;
	violations: WorktimeViolation[];
	summary: {
		total_hours: string;
		overtime_hours: string;
		night_hours: string;
		sunday_hours: string;
		max_weekly_hours_exceeded: boolean;
		annual_overtime_remaining: string;
	};
	legal_basis: string[];
}

export interface WorktimeViolation {
	date: string;
	rule: string;
	article: string;
	severity: "error" | "warning";
	message: string;
}
