/**
 * AUTOMATED ESTV QUELLENSTEUER TARIFF UPDATER
 *
 * This script is the entry point for the yearly tariff refresh. It is
 * idempotent, hash-aware, and CI-friendly.
 *
 * Workflow:
 *   1. Determine target year (CLI arg, env var, or current year)
 *   2. Download the official ESTV bulk archive for that year
 *   3. Compute SHA-256 of the downloaded archive
 *   4. Compare against the previously seen hash (data/qst-{YEAR}/.source-hash)
 *   5. If unchanged: exit 0 with "no changes" — safe to call repeatedly
 *   6. If changed (or first run): extract, run parser, write hash, exit 0
 *   7. If ESTV file does not exist (year not yet published): exit 0 with "skip"
 *
 * Exit codes:
 *   0 = success (no-op or updated)
 *   2 = ESTV server unreachable
 *   3 = parser failed
 *   4 = unexpected error
 *
 * Environment overrides:
 *   QST_YEAR        — target year (overrides default current year)
 *   QST_FORCE       — set to "1" to force re-download even if hash matches
 *   QST_BASE_URL    — override the ESTV bulk download URL prefix
 *
 * Usage:
 *   pnpm tsx scripts/update-qst-tariffs.ts            # current year
 *   pnpm tsx scripts/update-qst-tariffs.ts 2027       # explicit year
 *   QST_FORCE=1 pnpm tsx scripts/update-qst-tariffs.ts
 */

import {
	createHash,
} from "node:crypto";
import {
	createWriteStream,
	existsSync,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const DEFAULT_BASE = "https://www.estv2.admin.ch/qst";

interface UpdateResult {
	year: number;
	status: "updated" | "unchanged" | "skipped" | "failed";
	source_url: string;
	source_hash: string | null;
	previous_hash: string | null;
	canton_count: number | null;
	timestamp: string;
}

// ════════════════════════════════════════════════════════════════
// Configuration
// ════════════════════════════════════════════════════════════════

function resolveYear(): number {
	if (process.argv[2] && /^\d{4}$/.test(process.argv[2])) {
		return parseInt(process.argv[2], 10);
	}
	if (process.env.QST_YEAR && /^\d{4}$/.test(process.env.QST_YEAR)) {
		return parseInt(process.env.QST_YEAR, 10);
	}
	return new Date().getFullYear();
}

function buildSourceUrl(year: number): string {
	const base = process.env.QST_BASE_URL || DEFAULT_BASE;
	return `${base}/${year}/loehne/tar${year}txt.zip`;
}

const YEAR = resolveYear();
const FORCE = process.env.QST_FORCE === "1";
const SOURCE_URL = buildSourceUrl(YEAR);

const RAW_DIR = join(ROOT, `data/qst-${YEAR}`);
const ZIP_PATH = join(RAW_DIR, "zips", `tar${YEAR}txt.zip`);
const EXTRACTED_DIR = join(RAW_DIR, "extracted");
const OUTPUT_DIR = join(ROOT, `packages/swiss-data/data/qst-${YEAR}`);
const HASH_FILE = join(OUTPUT_DIR, ".source-hash");
const RESULT_FILE = join(OUTPUT_DIR, ".update-result.json");

// ════════════════════════════════════════════════════════════════
// Logging
// ════════════════════════════════════════════════════════════════

function log(level: "info" | "warn" | "error", msg: string) {
	const ts = new Date().toISOString();
	const icon = level === "error" ? "❌" : level === "warn" ? "⚠️ " : "ℹ️ ";
	console.log(`${icon} [${ts}] ${msg}`);
}

// ════════════════════════════════════════════════════════════════
// Network helpers
// ════════════════════════════════════════════════════════════════

async function checkUrlExists(url: string): Promise<boolean> {
	try {
		const res = await fetch(url, {
			method: "HEAD",
			headers: { "User-Agent": "RappenTariffUpdater/1.0" },
		});
		return res.ok;
	} catch (err) {
		log("warn", `HEAD ${url} failed: ${err instanceof Error ? err.message : err}`);
		return false;
	}
}

async function downloadFile(url: string, destPath: string): Promise<{ bytes: number; hash: string }> {
	mkdirSync(dirname(destPath), { recursive: true });

	const res = await fetch(url, {
		headers: { "User-Agent": "RappenTariffUpdater/1.0" },
	});

	if (!res.ok) {
		throw new Error(`Download failed: HTTP ${res.status} ${res.statusText}`);
	}

	if (!res.body) {
		throw new Error("Response has no body");
	}

	const hash = createHash("sha256");
	const out = createWriteStream(destPath);
	let bytes = 0;

	const stream = Readable.fromWeb(res.body as never).on("data", (chunk: Buffer) => {
		hash.update(chunk);
		bytes += chunk.length;
	});

	await pipeline(stream, out);

	return { bytes, hash: hash.digest("hex") };
}

// ════════════════════════════════════════════════════════════════
// Hash management
// ════════════════════════════════════════════════════════════════

function readPreviousHash(): string | null {
	if (!existsSync(HASH_FILE)) return null;
	try {
		return readFileSync(HASH_FILE, "utf-8").trim();
	} catch {
		return null;
	}
}

function writeHash(hash: string) {
	mkdirSync(dirname(HASH_FILE), { recursive: true });
	writeFileSync(HASH_FILE, hash + "\n", "utf-8");
}

// ════════════════════════════════════════════════════════════════
// Subprocess helpers
// ════════════════════════════════════════════════════════════════

function runCmd(
	cmd: string,
	args: string[],
	cwd: string,
	label: string,
): { ok: boolean; output: string } {
	log("info", `$ ${cmd} ${args.join(" ")}`);
	const result = spawnSync(cmd, args, { cwd, encoding: "utf-8" });
	const output = (result.stdout || "") + (result.stderr || "");
	if (result.status !== 0) {
		log("error", `${label} failed (exit ${result.status}):\n${output}`);
		return { ok: false, output };
	}
	return { ok: true, output };
}

function extractArchive(zipPath: string, destDir: string): boolean {
	mkdirSync(destDir, { recursive: true });
	const result = runCmd("unzip", ["-o", "-q", zipPath, "-d", destDir], ROOT, "unzip");
	return result.ok;
}

function runParser(year: number): boolean {
	const result = runCmd(
		"npx",
		["tsx", "scripts/parse-estv-tariffs.ts", year.toString()],
		ROOT,
		"parser",
	);
	return result.ok;
}

// ════════════════════════════════════════════════════════════════
// Result reporting
// ════════════════════════════════════════════════════════════════

function writeResult(result: UpdateResult) {
	mkdirSync(dirname(RESULT_FILE), { recursive: true });
	writeFileSync(RESULT_FILE, JSON.stringify(result, null, 2) + "\n", "utf-8");
}

function emitGitHubOutput(key: string, value: string) {
	const out = process.env.GITHUB_OUTPUT;
	if (!out) return;
	try {
		writeFileSync(out, `${key}=${value}\n`, { flag: "a" });
	} catch (err) {
		log("warn", `Could not write GITHUB_OUTPUT: ${err instanceof Error ? err.message : err}`);
	}
}

// ════════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════════

async function main() {
	log("info", `🪙 Rappen QST tariff updater — target year ${YEAR}`);
	log("info", `Source URL: ${SOURCE_URL}`);
	log("info", `Force mode: ${FORCE ? "ON" : "off"}`);

	// 1. Check if the ESTV file exists for this year
	const exists = await checkUrlExists(SOURCE_URL);
	if (!exists) {
		log(
			"warn",
			`ESTV has not yet published the ${YEAR} tariffs. This is normal between January and early December of the previous year.`,
		);
		const result: UpdateResult = {
			year: YEAR,
			status: "skipped",
			source_url: SOURCE_URL,
			source_hash: null,
			previous_hash: readPreviousHash(),
			canton_count: null,
			timestamp: new Date().toISOString(),
		};
		// Don't write hash file (year not started). Don't exit non-zero — this is expected.
		emitGitHubOutput("status", "skipped");
		emitGitHubOutput("year", YEAR.toString());
		console.log(JSON.stringify(result, null, 2));
		process.exit(0);
	}

	// 2. Download the archive
	log("info", `Downloading ${SOURCE_URL}…`);
	let downloaded: { bytes: number; hash: string };
	try {
		downloaded = await downloadFile(SOURCE_URL, ZIP_PATH);
	} catch (err) {
		log("error", `Download failed: ${err instanceof Error ? err.message : err}`);
		process.exit(2);
	}
	log(
		"info",
		`Downloaded ${(downloaded.bytes / 1024 / 1024).toFixed(2)} MB · SHA-256 ${downloaded.hash.substring(0, 12)}…`,
	);

	// 3. Compare hash
	const previousHash = readPreviousHash();
	if (!FORCE && previousHash === downloaded.hash) {
		log("info", `✓ No changes — hash matches previously committed data.`);
		const result: UpdateResult = {
			year: YEAR,
			status: "unchanged",
			source_url: SOURCE_URL,
			source_hash: downloaded.hash,
			previous_hash: previousHash,
			canton_count: existsSync(OUTPUT_DIR)
				? require("node:fs")
						.readdirSync(OUTPUT_DIR)
						.filter((f: string) => f.endsWith(".json.gz")).length
				: null,
			timestamp: new Date().toISOString(),
		};
		writeResult(result);
		emitGitHubOutput("status", "unchanged");
		emitGitHubOutput("year", YEAR.toString());
		emitGitHubOutput("hash", downloaded.hash);
		console.log(JSON.stringify(result, null, 2));
		process.exit(0);
	}

	// 4. Extract
	log("info", `Extracting to ${EXTRACTED_DIR}…`);
	if (!extractArchive(ZIP_PATH, EXTRACTED_DIR)) {
		process.exit(3);
	}

	// 5. Run parser
	log("info", `Running parser for year ${YEAR}…`);
	if (!runParser(YEAR)) {
		process.exit(3);
	}

	// 6. Write new hash
	writeHash(downloaded.hash);

	// 7. Count generated files
	const fs = await import("node:fs");
	const cantonFiles = existsSync(OUTPUT_DIR)
		? fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".json.gz"))
		: [];

	const result: UpdateResult = {
		year: YEAR,
		status: "updated",
		source_url: SOURCE_URL,
		source_hash: downloaded.hash,
		previous_hash: previousHash,
		canton_count: cantonFiles.length,
		timestamp: new Date().toISOString(),
	};
	writeResult(result);

	log("info", `✅ Updated ${cantonFiles.length} canton tariff files for ${YEAR}`);
	if (previousHash) {
		log("info", `   Previous hash: ${previousHash.substring(0, 12)}…`);
		log("info", `   New hash:      ${downloaded.hash.substring(0, 12)}…`);
	} else {
		log("info", `   First-time generation (no previous hash)`);
	}

	emitGitHubOutput("status", "updated");
	emitGitHubOutput("year", YEAR.toString());
	emitGitHubOutput("hash", downloaded.hash);
	emitGitHubOutput("canton_count", cantonFiles.length.toString());

	console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
	log("error", `Unexpected error: ${err instanceof Error ? err.stack || err.message : err}`);
	process.exit(4);
});
