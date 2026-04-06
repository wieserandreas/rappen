import { describe, it, expect } from "vitest";
import { validateContractInput, prepareContract, CONTRACT_TYPE_NAMES } from "@rappen/swiss-data";
import type { ContractInput, ContractType } from "@rappen/shared";

function makeInput(type: ContractType, overrides: Partial<ContractInput> = {}): ContractInput {
	return {
		type,
		language: "de",
		canton: "ZH",
		parties: [
			{ role: "employer", name: "Rappen AG", address: "Bahnhofstrasse 10", city: "Zürich", postal_code: "8001" },
			{ role: "employee", name: "Max Muster", address: "Seestrasse 5", city: "Zürich", postal_code: "8002" },
		],
		parameters: {},
		...overrides,
	};
}

describe("Contracts – Type Registry", () => {
	it("should have 10 contract types", () => {
		expect(Object.keys(CONTRACT_TYPE_NAMES)).toHaveLength(10);
	});

	it("should have DE/FR/IT names for each type", () => {
		for (const [type, names] of Object.entries(CONTRACT_TYPE_NAMES)) {
			expect(names.de, `${type} missing de`).toBeDefined();
			expect(names.fr, `${type} missing fr`).toBeDefined();
			expect(names.it, `${type} missing it`).toBeDefined();
		}
	});
});

describe("Contracts – Validation", () => {
	it("should validate correct employment contract input", () => {
		const result = validateContractInput(makeInput("employment-permanent"));
		expect(result.valid).toBe(true);
	});

	it("should reject input with fewer than 2 parties", () => {
		const result = validateContractInput(makeInput("employment-permanent", {
			parties: [{ role: "employer", name: "Test", address: "A", city: "Z", postal_code: "1" }],
		}));
		expect(result.valid).toBe(false);
		expect(result.warnings.some(w => w.includes("2 Vertragsparteien"))).toBe(true);
	});
});

describe("Contracts – Prepare Contract", () => {
	const allTypes: ContractType[] = [
		"employment-permanent", "employment-fixed-term", "freelancer", "nda",
		"termination-agreement", "internship", "ceo-contract", "shareholder-agreement",
		"service-agreement-b2b", "commercial-lease",
	];

	for (const type of allTypes) {
		it(`should prepare ${type} correctly`, () => {
			const prepared = prepareContract(makeInput(type));
			expect(prepared.template_name).toBe(`${type}.hbs`);
			expect(prepared.required_clauses.length).toBeGreaterThan(0);
			expect(prepared.legal_basis.length).toBeGreaterThan(0);
			expect(prepared.disclaimer).toContain("Rappen");
			expect(prepared.title.length).toBeGreaterThan(0);
		});
	}

	it("should use French title when language is FR", () => {
		const prepared = prepareContract(makeInput("employment-permanent", { language: "fr" }));
		expect(prepared.title).toContain("indéterminée");
	});
});
