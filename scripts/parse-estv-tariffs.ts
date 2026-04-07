/**
 * Parse ESTV Quellensteuer tariff TXT files into structured JSON.
 *
 * Source format: ESTV "Aufbau und Recordformate der Quellensteuer-Tarife"
 * Document D_DVS Nr. 0005, valid from 2025-01-01.
 *
 * Usage:
 *   pnpm tsx scripts/parse-estv-tariffs.ts            # uses current year
 *   pnpm tsx scripts/parse-estv-tariffs.ts 2027       # explicit year
 *
 * Input:  data/qst-{YEAR}/extracted/tar{YY}{canton}.txt (CRLF, ASCII, fixed-width)
 * Output: packages/swiss-data/data/qst-{YEAR}/{CANTON}.json.gz
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Year is configurable: CLI arg or current year (with fallback to next year if it's late in the year)
function resolveYear(): number {
	const arg = process.argv[2];
	if (arg && /^\d{4}$/.test(arg)) {
		return parseInt(arg, 10);
	}
	// Default: current year
	return new Date().getFullYear();
}

const YEAR = resolveYear();
const YY = (YEAR % 100).toString().padStart(2, "0");
const INPUT_DIR = join(ROOT, `data/qst-${YEAR}/extracted`);
// Output goes OUTSIDE src/ so the JSON files are not bundled by webpack/turbo.
// They are read at runtime via fs.readFileSync from the loader.
const OUTPUT_DIR = join(ROOT, `packages/swiss-data/data/qst-${YEAR}`);

console.log(`📅 Target year: ${YEAR} (file prefix: tar${YY})`);

// ════════════════════════════════════════════════════════════════
// Record types per ESTV spec section 3
// ════════════════════════════════════════════════════════════════
type RecordType = "00" | "06" | "11" | "12" | "13" | "99";

/**
 * Recordart 06: Progressive Quellensteuertarife.
 *
 * Field positions (1-indexed, inclusive) per spec section 3.3:
 *   1-2   Recordart           (always "06")
 *   3-4   Transaktionsart     (01 = Neuzugang, 02 = Mutation, 03 = Löschung)
 *   5-6   Kanton              (2-letter code)
 *   7-16  QSt-Code            (10 chars, e.g. "A0N       ")
 *   17-24 Datum gültig ab     (JJJJMMTT)
 *   25-33 Steuerbares Eink. ab (9 chars: 7 integer + 2 decimal centimes)
 *   34-42 Tarifschritt        (9 chars: 7 integer + 2 decimal centimes)
 *   43    Code Geschlecht     (always blank for type 06)
 *   44-45 Anzahl Kinder       (00-09)
 *   46-54 Mindeststeuer       (9 chars: 7 integer + 2 decimal centimes)
 *   55-59 Steuer %-Satz       (5 chars: 3 integer + 2 decimal)
 *   60-62 Code Status         (always blank)
 */
export interface TariffBracket {
	/** Lower bound of the income bracket in CHF (inclusive) */
	from: number;
	/** Upper bound of the income bracket in CHF (exclusive) */
	to: number;
	/** Effective tax rate in % */
	rate: number;
	/** Minimum tax in CHF (Mindeststeuer); 0 if not applicable */
	min_tax: number;
}

/**
 * Compact bracket tuple: [from, rate, min_tax].
 * The implicit `to` is the next bracket's `from`, or +Infinity for the last.
 * This format saves ~70% space vs. object-per-bracket.
 */
export type CompactBracket = [number, number, number];

export interface CompactTariffSeries {
	/** Tariff group letter (A-H, L-Q, R-V) */
	g: string;
	/** Number of children (0-9) */
	c: number;
	/** Church tax: true if "Y", false if "N" */
	k: boolean;
	/** Compact brackets array */
	b: CompactBracket[];
}

export interface CantonTariffData {
	canton: string;
	year: number;
	created_at: string;
	source: string;
	notes: string;
	/** Median income for canton (record type 13), in CHF; null if not present */
	median_salary: number | null;
	/** All progressive tariffs (record type 06), keyed by full code (e.g. "A0N") */
	tariffs: Record<string, CompactTariffSeries>;
}

// ════════════════════════════════════════════════════════════════
// Parsing primitives
// ════════════════════════════════════════════════════════════════

/** Slice 1-indexed, inclusive end. */
function slice1(line: string, from: number, to: number): string {
	return line.substring(from - 1, to);
}

/** Parse a 9-char numeric field (7 integer + 2 decimal centimes) → CHF. */
function parseAmount9(s: string): number {
	const cleaned = s.trim();
	if (!cleaned || /^0+$/.test(cleaned)) return 0;
	if (!/^\d{9}$/.test(cleaned)) {
		throw new Error(`Invalid 9-char amount: "${s}"`);
	}
	const integer = parseInt(cleaned.substring(0, 7), 10);
	const decimal = parseInt(cleaned.substring(7, 9), 10);
	return integer + decimal / 100;
}

/** Parse a 5-char percentage field (3 integer + 2 decimal) → percent value. */
function parsePercent5(s: string): number {
	const cleaned = s.trim();
	if (!cleaned || /^0+$/.test(cleaned)) return 0;
	if (!/^\d{5}$/.test(cleaned)) {
		throw new Error(`Invalid 5-char percent: "${s}"`);
	}
	const integer = parseInt(cleaned.substring(0, 3), 10);
	const decimal = parseInt(cleaned.substring(3, 5), 10);
	return integer + decimal / 100;
}

/** Parse JJJJMMTT → ISO date YYYY-MM-DD. */
function parseDate8(s: string): string {
	if (!/^\d{8}$/.test(s)) {
		throw new Error(`Invalid date: "${s}"`);
	}
	return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
}

/** Parse a single line and return a parsed record (or null if header/footer/skipped). */
interface ParsedRow06 {
	type: "06";
	transaction: string;
	canton: string;
	code: string;
	group: string;
	children: number;
	church: boolean;
	valid_from: string;
	income_from: number;
	step: number;
	min_tax: number;
	rate: number;
}

interface ParsedRow13 {
	type: "13";
	canton: string;
	median_salary: number;
}

type ParsedRow = ParsedRow06 | ParsedRow13 | { type: "00" | "11" | "12" | "99" };

function parseLine(rawLine: string, lineNo: number, fileName: string): ParsedRow | null {
	// Strip CR and any trailing whitespace
	const line = rawLine.replace(/\r$/, "");
	if (line.length < 2) return null;

	const recordType = line.substring(0, 2) as RecordType;

	if (recordType === "00" || recordType === "11" || recordType === "12" || recordType === "99") {
		return { type: recordType };
	}

	if (recordType !== "06" && recordType !== "13") {
		throw new Error(`${fileName}:${lineNo}: Unknown record type "${recordType}"`);
	}

	if (line.length < 62) {
		throw new Error(
			`${fileName}:${lineNo}: Record ${recordType} too short (${line.length} chars, expected ≥62)`,
		);
	}

	const transaction = slice1(line, 3, 4);
	const canton = slice1(line, 5, 6);
	const codeRaw = slice1(line, 7, 16).trim();
	const validFrom = parseDate8(slice1(line, 17, 24));
	const incomeFrom = parseAmount9(slice1(line, 25, 33));
	const step = parseAmount9(slice1(line, 34, 42));
	// position 43 = Geschlecht (blank, ignored)
	const childrenStr = slice1(line, 44, 45);
	const minTax = parseAmount9(slice1(line, 46, 54));
	const rate = parsePercent5(slice1(line, 55, 59));

	if (recordType === "13") {
		// Median salary record: stored in min_tax field per spec
		return {
			type: "13",
			canton,
			median_salary: minTax,
		};
	}

	// recordType === "06"
	if (codeRaw.length < 3) {
		throw new Error(`${fileName}:${lineNo}: Tariff code too short: "${codeRaw}"`);
	}

	// codeRaw format: tariffGroup + childCount + churchFlag, e.g. "A0N", "B2Y", "H1N"
	// Some codes are letter-only special markers (NON, NOY, SFN, etc.) — those come as record type 11.
	const groupChar = codeRaw[0];
	const children = parseInt(codeRaw[1] ?? "0", 10);
	const churchChar = codeRaw[2];
	const church = churchChar === "Y";

	if (Number.isNaN(children)) {
		throw new Error(`${fileName}:${lineNo}: Invalid children digit in code "${codeRaw}"`);
	}

	return {
		type: "06",
		transaction,
		canton,
		code: codeRaw,
		group: groupChar,
		children,
		church,
		valid_from: validFrom,
		income_from: incomeFrom,
		step,
		min_tax: minTax,
		rate,
	};
}

// ════════════════════════════════════════════════════════════════
// Build canton data from raw rows
// ════════════════════════════════════════════════════════════════

function buildCantonData(canton: string, fileName: string, raw: string): CantonTariffData {
	const lines = raw.split("\n");
	// Intermediate raw bracket buffers, keyed by tariff code
	const rawBuffers: Record<
		string,
		{
			group: string;
			children: number;
			church: boolean;
			brackets: TariffBracket[];
		}
	> = {};
	let medianSalary: number | null = null;
	let createdAt = "";

	// Parse header for created_at
	for (const line of lines) {
		const stripped = line.replace(/\r$/, "");
		if (stripped.startsWith("00")) {
			if (stripped.length >= 27) {
				const dateRaw = stripped.substring(19, 27);
				if (/^\d{8}$/.test(dateRaw)) {
					createdAt = parseDate8(dateRaw);
				}
			}
			break;
		}
	}

	for (let i = 0; i < lines.length; i++) {
		const parsed = parseLine(lines[i], i + 1, fileName);
		if (!parsed) continue;
		if (parsed.type === "13") {
			medianSalary = parsed.median_salary;
			continue;
		}
		if (parsed.type !== "06") continue;
		if (parsed.transaction === "03") continue;
		if (parsed.group === "G" || parsed.group === "Q" || parsed.group === "V") continue;

		if (!rawBuffers[parsed.code]) {
			rawBuffers[parsed.code] = {
				group: parsed.group,
				children: parsed.children,
				church: parsed.church,
				brackets: [],
			};
		}
		rawBuffers[parsed.code].brackets.push({
			from: parsed.income_from,
			to: parsed.income_from + parsed.step,
			rate: parsed.rate,
			min_tax: parsed.min_tax,
		});
	}

	// Collapse adjacent equal-rate brackets, then convert to compact tuple form
	const tariffs: Record<string, CompactTariffSeries> = {};
	for (const code of Object.keys(rawBuffers)) {
		const buf = rawBuffers[code];
		const sorted = buf.brackets.sort((a, b) => a.from - b.from);
		const collapsed: TariffBracket[] = [];
		for (const b of sorted) {
			const last = collapsed[collapsed.length - 1];
			if (
				last &&
				last.rate === b.rate &&
				last.min_tax === b.min_tax &&
				Math.abs(last.to - b.from) < 0.005
			) {
				last.to = b.to;
			} else {
				collapsed.push({ ...b });
			}
		}
		tariffs[code] = {
			g: buf.group,
			c: buf.children,
			k: buf.church,
			b: collapsed.map((br) => [br.from, br.rate, br.min_tax] as CompactBracket),
		};
	}

	return {
		canton,
		year: YEAR,
		created_at: createdAt,
		source: `ESTV Schweiz Quellensteuertarife ${YEAR} (Lohnformat, official)`,
		notes:
			"Generated by scripts/parse-estv-tariffs.ts from official ESTV data. Brackets are stored as [from, rate, min_tax] tuples; the implicit upper bound is the next bracket's `from`.",
		median_salary: medianSalary,
		tariffs,
	};
}

// ════════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════════

function main() {
	if (!existsSync(INPUT_DIR)) {
		console.error(`❌ Input directory not found: ${INPUT_DIR}`);
		process.exit(1);
	}
	if (!existsSync(OUTPUT_DIR)) {
		mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	const filePattern = new RegExp(`^tar${YY}[a-z]{2}\\.txt$`);
	const files = readdirSync(INPUT_DIR).filter((f) => filePattern.test(f)).sort();

	if (files.length === 0) {
		console.error(`❌ No tar${YY}??.txt files found in ${INPUT_DIR}`);
		process.exit(1);
	}

	console.log(`🪙 Parsing ${files.length} canton tariff files…\n`);

	let totalTariffs = 0;
	let totalBrackets = 0;
	let errors = 0;
	const summary: Array<{ canton: string; tariffs: number; brackets: number; median: number | null }> = [];

	for (const file of files) {
		// "tar26ag.txt" → "ag"; "tar27zh.txt" → "zh"
		const cantonLower = file.substring(file.length - 6, file.length - 4);
		const canton = cantonLower.toUpperCase();
		const raw = readFileSync(join(INPUT_DIR, file), "ascii");

		try {
			const data = buildCantonData(canton, file, raw);
			const tariffCount = Object.keys(data.tariffs).length;
			const bracketCount = Object.values(data.tariffs).reduce(
				(sum, t) => sum + t.b.length,
				0,
			);

			if (tariffCount === 0) {
				console.warn(`  ⚠️  ${canton}: 0 tariffs parsed (file may be empty or unsupported)`);
				continue;
			}

			const json = JSON.stringify(data);
			writeFileSync(join(OUTPUT_DIR, `${canton}.json.gz`), gzipSync(json, { level: 9 }));

			totalTariffs += tariffCount;
			totalBrackets += bracketCount;
			summary.push({
				canton,
				tariffs: tariffCount,
				brackets: bracketCount,
				median: data.median_salary,
			});

			console.log(
				`  ✅ ${canton}: ${tariffCount.toString().padStart(3)} tariffs, ` +
					`${bracketCount.toString().padStart(5)} brackets` +
					(data.median_salary ? `, median CHF ${data.median_salary.toFixed(2)}` : ""),
			);
		} catch (err) {
			errors++;
			console.error(`  ❌ ${canton}: ${err instanceof Error ? err.message : err}`);
		}
	}

	console.log(`\n${"═".repeat(60)}`);
	console.log(`Total: ${summary.length} cantons, ${totalTariffs} tariffs, ${totalBrackets} brackets`);
	if (errors > 0) console.log(`❌ ${errors} parsing errors`);
	console.log("═".repeat(60));

	if (errors > 0) process.exit(1);
}

main();
