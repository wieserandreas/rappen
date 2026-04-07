# ESTV Quellensteuertarife 2026 — Generated Data

This directory contains **machine-generated** gzipped JSON files with the
official Swiss withholding tax tariffs for all 26 cantons, valid from
**1 January 2026**.

## Source

These files are derived from the official ESTV publication:

- **Origin:** Eidgenössische Steuerverwaltung (ESTV), Hauptabteilung Direkte
  Bundessteuer
- **Format spec:** [D_DVS Nr. 0005 — Aufbau und Recordformate der
  Quellensteuer-Tarife](https://www.estv.admin.ch/dam/de/sd-web/AvojuyFCZY95/qst-tarife-recordformate-loehne-2025-de.pdf)
- **Download index:** <https://www.estv.admin.ch/estv/de/home/direkte-bundessteuer/dbst-quellensteuer/qst-tarife-loehne.html>
- **Bulk archive:** <https://www.estv2.admin.ch/qst/2026/loehne/tar2026txt.zip>

## Automated updates

Tariffs are refreshed automatically by the
[`qst-tariff-update`](../../../../.github/workflows/qst-tariff-update.yml)
GitHub Action, which runs **every Monday at 03:00 UTC** during the publication
window. The action:

1. Calls `scripts/update-qst-tariffs.ts`, which downloads the bulk archive
   from the ESTV server
2. Compares the SHA-256 of the new archive against `.source-hash` in this
   directory
3. If unchanged: exits with no action
4. If changed: regenerates all `*.json.gz` files, runs the full test suite,
   and opens a pull request with a summary

Manual trigger via GitHub UI: **Actions → QST Tariff Update → Run workflow**.

## How to regenerate locally

```bash
# Single command — handles download, hash check, extract, parse
pnpm tsx scripts/update-qst-tariffs.ts

# Explicit year
pnpm tsx scripts/update-qst-tariffs.ts 2027

# Force re-download even if hash matches
QST_FORCE=1 pnpm tsx scripts/update-qst-tariffs.ts
```

The lower-level parser can also be invoked directly if you have manually
downloaded and extracted the ESTV ZIP into `data/qst-{YEAR}/extracted/`:

```bash
pnpm tsx scripts/parse-estv-tariffs.ts            # current year
pnpm tsx scripts/parse-estv-tariffs.ts 2027       # explicit year
```

Either workflow produces one `{CANTON}.json.gz` file per canton in this
directory plus a `.source-hash` file used for change detection.

## File format

Each file contains a `CantonTariffData` object (see
[`packages/swiss-data/src/withholding-tax/types.ts`](../../src/withholding-tax/types.ts)):

```ts
{
  canton: "ZH",
  year: 2026,
  created_at: "2025-12-08",
  source: "ESTV Schweiz Quellensteuertarife 2026 (Lohnformat, official)",
  notes: "...",
  median_salary: 5875.00,
  tariffs: {
    "A0N": { g: "A", c: 0, k: false, b: [[1, 0.25, 0], [801, 0.50, 0], ...] },
    "A0Y": { ... },
    "B0N": { ... },
    // ... up to ~158 tariff codes per canton
  }
}
```

Each bracket is a tuple `[from, rate, min_tax]`:
- `from`: lower income bound in CHF (inclusive)
- `rate`: effective tax rate in percent
- `min_tax`: minimum tax in CHF (Mindeststeuer); 0 if not applicable

The implicit upper bound of each bracket is the next bracket's `from`.

## Bracket compression

The parser collapses consecutive brackets with identical `(rate, min_tax)`
into a single bracket. This reduces the total bracket count from ~2.7M to
~1.3M while preserving exact calculation correctness.

## Compliance

These files are read at runtime via `fs.readFileSync` from the
[`loader.ts`](../../src/withholding-tax/tariffs/loader.ts) module. They are
**not bundled by webpack** — Next.js' file tracing must include this directory
in the deployment package (Vercel does this automatically when files are
read via `fs` with a path resolved from `import.meta.url`).

## Annual updates

The ESTV publishes new tariffs every December for the following year.
Re-run the parser after each year-end to update.
