import { describe, it, expect } from "vitest";
import { CANTONS } from "@rappen/shared";
import { FAK_2026 } from "@rappen/swiss-data";
import { CANTON_REGISTRY } from "@rappen/swiss-data";

describe("All 26 Cantons – FAK Data Completeness", () => {
	for (const code of CANTONS) {
		it(`${code} should have complete FAK and canton data`, () => {
			const fak = FAK_2026[code];
			const canton = CANTON_REGISTRY[code];

			expect(fak, `FAK data missing for ${code}`).toBeDefined();
			expect(canton, `Canton data missing for ${code}`).toBeDefined();

			// FAK values must be positive
			expect(fak.child_allowance.greaterThan(0)).toBe(true);
			expect(fak.education_allowance.greaterThan(0)).toBe(true);
			expect(fak.employer_rate.greaterThan(0)).toBe(true);

			// Education allowance must be >= child allowance
			expect(fak.education_allowance.greaterThanOrEqualTo(fak.child_allowance)).toBe(true);

			// Canton must have all translations
			expect(canton.name_de.length).toBeGreaterThan(0);
			expect(canton.name_fr.length).toBeGreaterThan(0);
			expect(canton.name_it.length).toBeGreaterThan(0);
			expect(canton.name_en.length).toBeGreaterThan(0);
		});
	}
});
