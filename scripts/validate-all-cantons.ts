import { CANTONS } from "@rappen/shared";
import { CANTON_REGISTRY } from "@rappen/swiss-data";
import { FAK_2026 } from "@rappen/swiss-data";

/**
 * Validates that all 26 cantons have complete data.
 * Run with: pnpm validate:cantons
 */
function validateCantons() {
	let errors = 0;

	console.log("🪙 Validating all 26 cantons...\n");

	for (const code of CANTONS) {
		const canton = CANTON_REGISTRY[code];
		const fak = FAK_2026[code];

		if (!canton) {
			console.error(`❌ ${code}: Missing from CANTON_REGISTRY`);
			errors++;
			continue;
		}

		if (!fak) {
			console.error(`❌ ${code}: Missing from FAK_2026`);
			errors++;
			continue;
		}

		if (!canton.name_de || !canton.name_fr || !canton.name_it) {
			console.error(`❌ ${code}: Missing translations`);
			errors++;
		}

		if (!fak.child_allowance || !fak.education_allowance || !fak.employer_rate) {
			console.error(`❌ ${code}: Incomplete FAK data`);
			errors++;
		}

		console.log(`✅ ${code}: ${canton.name_de} – FAK CHF ${fak.child_allowance}/${fak.education_allowance}`);
	}

	console.log(`\n${errors === 0 ? "✅" : "❌"} ${CANTONS.length} Kantone geprüft, ${errors} Fehler.`);
	process.exit(errors > 0 ? 1 : 0);
}

validateCantons();
