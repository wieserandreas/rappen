# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Rappen?

"Präzision auf den letzten Rappen." — API platform with 10 specialized B2B APIs for Swiss companies. Covers payroll, taxes, contracts, compliance — all via one interface.

- **Domain:** rappen.ch | **API:** api.rappen.ch/v1/
- **npm scope:** @rappen/
- **Auth:** Clerk | **Billing:** Stripe | **DB:** Neon PostgreSQL | **Cache:** Upstash Redis

## Commands

```bash
pnpm dev              # Start all (API + Web)
pnpm build            # Production build
pnpm test             # All tests (Vitest)
pnpm test:cantons     # Canton-specific tests only
pnpm validate:cantons # Verify all 26 cantons are complete
pnpm db:migrate       # Run Drizzle migrations
pnpm db:studio        # Open Drizzle Studio
pnpm lint             # Biome lint + format check
pnpm lint:fix         # Biome auto-fix
```

Run a single test file: `pnpm vitest run tests/api/payroll/payroll.test.ts`
Run tests matching a pattern: `pnpm vitest run -t "Kanton ZH"`

## Architecture

Turborepo monorepo with pnpm workspaces:

- **apps/api** — Hono.js REST API (Node.js). All 10 API endpoints under `src/routes/v1/`. Middleware handles auth, rate limiting, usage tracking, freemium gating.
- **apps/web** — Next.js 14+ App Router. Landing page, dashboard, API docs, and web tools (calculator forms, file upload, contract wizard). Uses Clerk for auth, next-intl for i18n (DE/FR/IT/EN).
- **packages/swiss-data** — Core calculation package. All Swiss legal data (tax rates, social insurance, canton rules, contract templates, GAV data) as TypeScript/JSON. Zero external dependencies at runtime. This is the heart of the platform.
- **packages/shared** — Shared TypeScript types, Zod validation schemas, and utilities (Swiss rounding, date helpers, CHF formatting).
- **packages/db** — Drizzle ORM schema and migrations for Neon PostgreSQL (users, API keys, usage, subscriptions, audit log).

### API Type Classification

| Type | APIs | Characteristic |
|------|------|----------------|
| **A** (pure calc) | 1–8 | All data in `swiss-data`, no external calls. Input → calculation → result. |
| **B** (external public APIs) | 9 | Calls ZEFIX/SHAB/UID (free, no API keys). Needs caching layer. |
| **C** (internal DB) | 10 | Uses maintained GAV database. No external API, but data needs periodic updates. |

### 3-Tier Freemium Model

- **Tier 0** (no account): QR-bill only, 3/day per IP, rate-limited via Upstash
- **Tier 1** (free Clerk account): + Payroll + Withholding Tax, 10 calcs/day
- **Tier 2+** (paid Stripe plans): All 10 APIs, CHF 149–999/mo

## Critical Rules

### Swiss Legal Precision
- **Every** calculation must be based on current official Swiss legal sources (admin.ch, cantonal websites, ESTV, BSV). Never estimate or approximate.
- **All 26 cantons** must be fully implemented — no placeholders, no "TODO: remaining cantons".
- Tag uncertain values with `[VERIFY]` and create a task.

### Money & Rounding
- **Always** use `decimal.js` for monetary calculations. Never use JavaScript floating-point arithmetic for CHF amounts.
- **Swiss 5-Rappen rounding** everywhere: `Math.round(amount * 20) / 20`

### Data Sources (Official)
- AHV/IV/EO, BVG: bsv.admin.ch
- Withholding tax: Cantonal tax authority websites (annual tariff PDFs/Excel)
- VAT: estv.admin.ch
- Labor law (ArG): seco.admin.ch
- ZEFIX: zefix.admin.ch/ZefixPublicREST/
- QR-Bill: SIX Group Standard v2.3
- GAV: seco.admin.ch

### i18n
- Primary: German (DE). Also: FR, IT, EN.
- Contract templates (API 7) must exist in DE, FR, and IT.
- API responses use German for legal references; `locale` parameter controls error messages.

## Build Phases

1. **Phase 1:** APIs 1–4 (Payroll, Withholding Tax, QR-Bill, VAT) — pure calculation, no external deps
2. **Phase 2:** APIs 5–7 (Worktime, Pay Equity, Contracts) — adds file upload (CSV/Excel) and PDF/DOCX generation
3. **Phase 3:** APIs 8–10 (Cross-Border, Company Risk, Temp Staffing) — adds external API clients and GAV database

## Deployment

- `main` → Production (rappen.ch + api.rappen.ch) via Vercel
- `staging` → Staging (staging.rappen.ch)
- Feature branches → Vercel Preview Deployments
- CI: GitHub Actions — tests must pass before merge
