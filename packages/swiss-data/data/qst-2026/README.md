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

## How to regenerate

```bash
# 1. Download and extract the official ESTV archive
mkdir -p data/qst-2026/zips data/qst-2026/extracted
curl -sSL -o data/qst-2026/zips/tar2026txt.zip \
  "https://www.estv2.admin.ch/qst/2026/loehne/tar2026txt.zip"
unzip -o data/qst-2026/zips/tar2026txt.zip -d data/qst-2026/extracted/

# 2. Run the parser
pnpm tsx scripts/parse-estv-tariffs.ts
```

This produces one `{CANTON}.json.gz` file per canton in this directory.

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
