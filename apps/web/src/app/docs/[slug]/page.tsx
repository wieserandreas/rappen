import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

const API_DOCS: Record<
	string,
	{
		number: string;
		name: string;
		description: string;
		endpoint: string;
		method: string;
		legalBasis: string;
		requestFields: Array<{ name: string; type: string; required: boolean; description: string }>;
		responseFields: Array<{ name: string; type: string; description: string }>;
		example: { request: string; response: string };
	}
> = {
	payroll: {
		number: "01",
		name: "Lohnberechnung",
		description:
			"Berechnet den vollständigen Schweizer Nettolohn aus dem Bruttolohn, inklusive AHV/IV/EO, ALV, BVG, UVG, Familienzulagen und kantonaler Abzüge.",
		endpoint: "/v1/payroll/calculate",
		method: "POST",
		legalBasis: "AHVG Art. 5, AVIG Art. 3, BVG Art. 7–16, UVG Art. 91–92, FamZG",
		requestFields: [
			{ name: "canton", type: "string", required: true, description: "Kantonskürzel (z.B. \"ZH\", \"BE\"). Alle 26 unterstützt." },
			{ name: "gross_monthly", type: "number", required: true, description: "Bruttolohn pro Monat in CHF." },
			{ name: "birth_year", type: "number", required: true, description: "Geburtsjahr (für BVG-Altersgutschrift)." },
			{ name: "employment_percentage", type: "number", required: true, description: "Beschäftigungsgrad (10–100)." },
			{ name: "children", type: "number", required: false, description: "Anzahl Kinder (für FAK)." },
			{ name: "church", type: "string", required: false, description: "\"keine\" | \"reformiert\" | \"katholisch\" | \"christkatholisch\"" },
			{ name: "thirteenth_salary", type: "boolean", required: false, description: "13. Monatslohn (Default: false)." },
			{ name: "uvg_nbu_rate", type: "number", required: true, description: "UVG NBU-Satz in % (branchenabhängig)." },
		],
		responseFields: [
			{ name: "net_salary", type: "string", description: "Nettolohn in CHF (5-Rappen-gerundet)." },
			{ name: "ahv_iv_eo", type: "object", description: "AHV/IV/EO Abzug (employee/employer/rate/basis)." },
			{ name: "alv", type: "object", description: "ALV Abzug." },
			{ name: "bvg", type: "object", description: "BVG Abzug." },
			{ name: "child_allowances", type: "object", description: "Familienzulagen (pro Kind, kantonsabhängig)." },
			{ name: "employer_costs", type: "object", description: "Arbeitgeberkosten (AHV/ALV/BVG/FAK)." },
		],
		example: {
			request: `{
  "canton": "ZH",
  "gross_monthly": 8500,
  "birth_year": 1990,
  "employment_percentage": 100,
  "uvg_nbu_rate": 1.5,
  "children": 0,
  "church": "keine",
  "thirteenth_salary": false
}`,
			response: `{
  "success": true,
  "data": {
    "gross_salary": "8500.00",
    "net_salary": "7026.65",
    "ahv_iv_eo": { "employee": "450.50", "rate_employee": "5.3%" },
    "alv": { "employee": "93.50", "rate_employee": "1.1%" },
    "bvg": { "employee": "260.30", "rate_employee": "5.00%" },
    "child_allowances": { "total_monthly": "0.00" },
    "employer_costs": { "total": "912.45" }
  }
}`,
		},
	},
	"withholding-tax": {
		number: "02",
		name: "Quellensteuer",
		description: "Berechnet die Quellensteuer basierend auf offiziellen ESTV-Tarifen für alle 26 Kantone.",
		endpoint: "/v1/withholding-tax/calculate",
		method: "POST",
		legalBasis: "DBG Art. 83–86, kantonale Steuergesetze",
		requestFields: [
			{ name: "canton", type: "string", required: true, description: "Kantonskürzel. Alle 26 Kantone." },
			{ name: "year", type: "number", required: true, description: "Steuerjahr (z.B. 2026)." },
			{ name: "tariff_code", type: "string", required: true, description: "A–H (siehe Tarifcodes)." },
			{ name: "children", type: "number", required: true, description: "Anzahl Kinder (0–9)." },
			{ name: "church", type: "string", required: true, description: "Konfession." },
			{ name: "gross_monthly", type: "number", required: true, description: "Bruttolohn pro Monat." },
			{ name: "thirteenth_salary", type: "boolean", required: true, description: "13. Monatslohn." },
		],
		responseFields: [
			{ name: "tax_amount", type: "string", description: "Steuerbetrag in CHF." },
			{ name: "effective_rate", type: "string", description: "Effektiver Steuersatz." },
			{ name: "tariff_code_full", type: "string", description: "Vollständiger Tarifcode (z.B. A0N)." },
		],
		example: {
			request: `{
  "canton": "ZH",
  "year": 2026,
  "tariff_code": "A",
  "children": 0,
  "church": "keine",
  "gross_monthly": 8500,
  "thirteenth_salary": false
}`,
			response: `{
  "success": true,
  "data": {
    "tax_amount": "772.65",
    "effective_rate": "9.09%",
    "tariff_code_full": "A0N",
    "canton": "ZH",
    "year": 2026
  }
}`,
		},
	},
	"qr-bill": {
		number: "03",
		name: "QR-Rechnung",
		description: "Erstellt, validiert und parst Schweizer QR-Rechnungen nach SIX Standard v2.3.",
		endpoint: "/v1/qr-bill/generate",
		method: "POST",
		legalBasis: "Swiss QR-Bill Standard v2.3 (SIX Group)",
		requestFields: [
			{ name: "creditor", type: "object", required: true, description: "Zahlungsempfänger (name, street, postal_code, city, country)." },
			{ name: "iban", type: "string", required: true, description: "Schweizer IBAN (QR-IBAN für QRR)." },
			{ name: "amount", type: "number", required: false, description: "Betrag in CHF (optional = offener Betrag)." },
			{ name: "reference_type", type: "string", required: true, description: "QRR | SCOR | NON." },
			{ name: "reference", type: "string", required: false, description: "Referenznummer." },
		],
		responseFields: [
			{ name: "qr_data", type: "string", description: "SPC v2.3 Payload für den QR-Code." },
			{ name: "validation", type: "object", description: "Validierungsergebnis mit Errors/Warnings." },
		],
		example: {
			request: `{
  "creditor": {
    "name": "Rappen AG",
    "street": "Bahnhofstrasse",
    "postal_code": "8001",
    "city": "Zürich",
    "country": "CH"
  },
  "iban": "CH4431999123000889012",
  "amount": 1500.50,
  "currency": "CHF",
  "reference_type": "NON",
  "language": "de"
}`,
			response: `{
  "success": true,
  "data": {
    "qr_data": "SPC\\n0200\\n1\\nCH4431999123000889012...",
    "validation": { "valid": true, "errors": [], "warnings": [] }
  }
}`,
		},
	},
	vat: {
		number: "04",
		name: "MWST",
		description: "Berechnet die Schweizer MWST mit effektiver oder Saldosteuersatz-Methode.",
		endpoint: "/v1/vat/calculate",
		method: "POST",
		legalBasis: "MWSTG Art. 25, 28, 37, 45",
		requestFields: [
			{ name: "transactions", type: "array", required: true, description: "Liste von Transaktionen mit description, amount, rate_type." },
			{ name: "method", type: "string", required: true, description: "\"effective\" | \"saldo\"." },
			{ name: "period", type: "object", required: true, description: "Abrechnungsperiode (from, to)." },
			{ name: "include_reverse_charge", type: "boolean", required: true, description: "Bezugsteuer einbeziehen." },
		],
		responseFields: [
			{ name: "vat_payable", type: "string", description: "Geschuldete MWST in CHF." },
			{ name: "breakdown", type: "array", description: "Aufschlüsselung nach Satz." },
			{ name: "optimization_tips", type: "array", description: "Optimierungsvorschläge." },
		],
		example: {
			request: `{
  "transactions": [
    { "description": "Beratung", "amount": 50000, "rate_type": "normal" }
  ],
  "method": "effective",
  "period": { "from": "2026-01-01", "to": "2026-03-31" },
  "include_reverse_charge": false
}`,
			response: `{
  "success": true,
  "data": {
    "total_revenue": "50000.00",
    "vat_payable": "4050.00",
    "breakdown": [{ "rate_type": "normal", "rate": "8.1%", "vat_amount": "4050.00" }]
  }
}`,
		},
	},
	worktime: { number: "05", name: "Arbeitszeit", description: "Prüft Zeiterfassung gegen das Arbeitsgesetz.", endpoint: "/v1/worktime/validate", method: "POST", legalBasis: "ArG Art. 9–36", requestFields: [{ name: "entries", type: "array", required: true, description: "Arbeitszeiteinträge (date, start, end, break_minutes)." }, { name: "employee", type: "object", required: true, description: "Alter, Branche, Nacht-/Sonntagsbewilligung." }], responseFields: [{ name: "compliant", type: "boolean", description: "ArG-konform." }, { name: "violations", type: "array", description: "Liste der Verstösse." }], example: { request: `{ "entries": [...], "employee": { "age": 30, "industry": "office" } }`, response: `{ "success": true, "data": { "compliant": true, "violations": [] } }` } },
	"pay-equity": { number: "06", name: "Lohngleichheit", description: "Logib-konforme Lohngleichheitsanalyse.", endpoint: "/v1/pay-equity/analyze", method: "POST", legalBasis: "GlG Art. 13", requestFields: [{ name: "employees", type: "array", required: true, description: "Mitarbeiterdaten (gender, salary, education, experience, ...)." }], responseFields: [{ name: "compliant", type: "boolean", description: "GlG-konform (< 5% Gap)." }, { name: "unexplained_gap_percent", type: "string", description: "Unerklärter Lohnunterschied." }], example: { request: `{ "employees": [...], "company_name": "..." }`, response: `{ "success": true, "data": { "compliant": true, "unexplained_gap_percent": "2.1%" } }` } },
	contracts: { number: "07", name: "Verträge", description: "Generiert Schweizer Vertragsentwürfe nach OR.", endpoint: "/v1/contracts/generate", method: "POST", legalBasis: "OR Art. 319–827", requestFields: [{ name: "type", type: "string", required: true, description: "Vertragstyp (10 Optionen)." }, { name: "language", type: "string", required: true, description: "de | fr | it | en." }, { name: "parties", type: "array", required: true, description: "Vertragsparteien." }], responseFields: [{ name: "required_clauses", type: "array", description: "Pflichtklauseln nach OR." }, { name: "legal_basis", type: "array", description: "Rechtsgrundlagen." }], example: { request: `{ "type": "employment-permanent", "language": "de", ... }`, response: `{ "success": true, "data": { "required_clauses": [...] } }` } },
	"cross-border": { number: "08", name: "Grenzgänger", description: "DBA-Analyse, Telework-Schwellen, LEADS.", endpoint: "/v1/cross-border/calculate", method: "POST", legalBasis: "VO 883/2004, DBA CH-DE/FR/IT/AT", requestFields: [{ name: "residence_country", type: "string", required: true, description: "DE | FR | IT | AT | LI." }, { name: "work_canton", type: "string", required: true, description: "Arbeitskanton." }, { name: "telework_days_per_year", type: "number", required: true, description: "Telework-Tage." }], responseFields: [{ name: "tax_jurisdiction", type: "string", description: "Steuerliche Zuständigkeit." }, { name: "social_security_country", type: "string", description: "SV-Land." }], example: { request: `{ "residence_country": "DE", "work_canton": "ZH", ... }`, response: `{ "success": true, "data": { "tax_jurisdiction": "CH (ZH)" } }` } },
	"company-risk": { number: "09", name: "Firmen-Risiko", description: "Risiko-Score aus ZEFIX, SHAB, UID-Register.", endpoint: "/v1/company-risk/score", method: "POST", legalBasis: "ZEFIX REST API, SHAB, UID-Register", requestFields: [{ name: "uid", type: "string", required: false, description: "UID (CHE-xxx.xxx.xxx)." }, { name: "company_name", type: "string", required: false, description: "Firmenname (Alternative zu UID)." }], responseFields: [{ name: "risk_score", type: "number", description: "Score 0–100." }, { name: "risk_level", type: "string", description: "low | medium | elevated | high." }, { name: "signals", type: "array", description: "Risiko-Signale." }], example: { request: `{ "uid": "CHE-100.155.933" }`, response: `{ "success": true, "data": { "risk_score": 85, "risk_level": "low" } }` } },
	"temp-staffing": { number: "10", name: "Personalverleih", description: "AVG-Compliance-Prüfung.", endpoint: "/v1/temp-staffing/validate", method: "POST", legalBasis: "AVG Art. 12–22", requestFields: [{ name: "assignment", type: "object", required: true, description: "Einsatzdaten (Kanton, Branche, Dauer)." }, { name: "worker", type: "object", required: true, description: "Arbeitnehmer (Bewilligung, Stundenlohn)." }, { name: "agency", type: "object", required: true, description: "Agentur (SECO-Lizenz, Kaution)." }], responseFields: [{ name: "compliant", type: "boolean", description: "AVG-konform." }, { name: "violations", type: "array", description: "Verstösse." }], example: { request: `{ "assignment": {...}, "worker": {...}, "agency": {...} }`, response: `{ "success": true, "data": { "compliant": true } }` } },
};

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const api = API_DOCS[slug];
	if (!api) return { title: "API-Dokumentation" };
	return {
		title: `${api.name} API`,
		description: api.description,
	};
}

export function generateStaticParams() {
	return Object.keys(API_DOCS).map((slug) => ({ slug }));
}

export default async function ApiDocPage({ params }: PageProps) {
	const { slug } = await params;
	const api = API_DOCS[slug];

	if (!api) {
		notFound();
	}

	return (
		<section className="py-12">
			<Container size="wide">
				{/* Breadcrumb */}
				<nav className="text-sm mb-8" aria-label="Breadcrumb">
					<ol className="flex items-center gap-2 text-rappen-muted">
						<li>
							<Link href="/docs" className="hover:text-rappen-charcoal transition-colors">
								API-Dokumentation
							</Link>
						</li>
						<li aria-hidden="true">
							<svg width="12" height="12" viewBox="0 0 12 12" className="text-rappen-muted/50">
								<path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</li>
						<li className="text-rappen-charcoal font-medium">{api.name}</li>
					</ol>
				</nav>

				{/* Header */}
				<div className="border-b border-rappen-border pb-8">
					<div className="flex items-baseline gap-3">
						<span className="font-mono text-sm text-rappen-gold">{api.number}</span>
						<h1 className="text-3xl font-semibold tracking-tight text-rappen-charcoal lg:text-4xl">
							{api.name}
						</h1>
					</div>
					<p className="mt-3 text-lg text-rappen-muted max-w-2xl">{api.description}</p>
					<div className="mt-4 flex items-center gap-4">
						<span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-700">
							{api.method}
						</span>
						<code className="font-mono text-sm text-rappen-charcoal">
							api.rappen.ch{api.endpoint}
						</code>
					</div>
					<p className="mt-3 font-mono text-xs uppercase tracking-wider text-rappen-muted/60">
						{api.legalBasis}
					</p>
				</div>

				<div className="mt-10 grid gap-12 lg:grid-cols-2">
					{/* Left: Fields */}
					<div>
						{/* Request */}
						<h2 className="text-lg font-semibold text-rappen-charcoal">Request Body</h2>
						<div className="mt-4 overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b border-rappen-border text-left">
										<th className="py-2 pr-4 font-semibold text-rappen-charcoal">Feld</th>
										<th className="py-2 pr-4 font-semibold text-rappen-charcoal">Typ</th>
										<th className="py-2 pr-4 font-semibold text-rappen-charcoal">Pflicht</th>
										<th className="py-2 font-semibold text-rappen-charcoal">Beschreibung</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-rappen-border/50">
									{api.requestFields.map((f) => (
										<tr key={f.name}>
											<td className="py-2.5 pr-4 font-mono text-xs text-rappen-charcoal">{f.name}</td>
											<td className="py-2.5 pr-4 text-xs text-rappen-muted">{f.type}</td>
											<td className="py-2.5 pr-4 text-xs">{f.required ? <span className="text-rappen-red">Ja</span> : <span className="text-rappen-muted">Nein</span>}</td>
											<td className="py-2.5 text-xs text-rappen-charcoal/80">{f.description}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Response */}
						<h2 className="mt-10 text-lg font-semibold text-rappen-charcoal">Response</h2>
						<div className="mt-4 overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b border-rappen-border text-left">
										<th className="py-2 pr-4 font-semibold text-rappen-charcoal">Feld</th>
										<th className="py-2 pr-4 font-semibold text-rappen-charcoal">Typ</th>
										<th className="py-2 font-semibold text-rappen-charcoal">Beschreibung</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-rappen-border/50">
									{api.responseFields.map((f) => (
										<tr key={f.name}>
											<td className="py-2.5 pr-4 font-mono text-xs text-rappen-charcoal">{f.name}</td>
											<td className="py-2.5 pr-4 text-xs text-rappen-muted">{f.type}</td>
											<td className="py-2.5 text-xs text-rappen-charcoal/80">{f.description}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Right: Code examples */}
					<div className="space-y-6">
						<div>
							<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-muted mb-3">
								Beispiel-Request
							</h3>
							<div className="rounded-xl bg-rappen-charcoal p-1">
								<div className="flex items-center gap-2 px-4 py-2">
									<span className="h-2.5 w-2.5 rounded-full bg-white/20" />
									<span className="h-2.5 w-2.5 rounded-full bg-white/20" />
									<span className="h-2.5 w-2.5 rounded-full bg-white/20" />
									<span className="ml-3 font-mono text-xs text-rappen-muted-dark">
										{api.method} api.rappen.ch{api.endpoint}
									</span>
								</div>
								<pre className="overflow-x-auto rounded-lg bg-black/40 p-5 font-mono text-[12px] leading-relaxed text-rappen-white">
									{api.example.request}
								</pre>
							</div>
						</div>

						<div>
							<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-muted mb-3">
								Beispiel-Response
							</h3>
							<div className="rounded-xl bg-rappen-charcoal p-1">
								<div className="flex items-center gap-2 px-4 py-2">
									<span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
									<span className="ml-3 font-mono text-xs text-rappen-muted-dark">
										200 OK
									</span>
								</div>
								<pre className="overflow-x-auto rounded-lg bg-black/40 p-5 font-mono text-[12px] leading-relaxed text-rappen-white">
									{api.example.response}
								</pre>
							</div>
						</div>

						{/* Tool link */}
						<div className="rounded-xl border border-rappen-border bg-rappen-cream/30 p-6 text-center">
							<p className="text-sm text-rappen-muted">
								Diese API auch als Web-Tool ausprobieren:
							</p>
							<Link href="/tools">
								<Button variant="outline" size="sm" className="mt-3">
									Zum Tool →
								</Button>
							</Link>
						</div>
					</div>
				</div>

				{/* Back to overview */}
				<div className="mt-16 border-t border-rappen-border pt-8">
					<Link
						href="/docs"
						className="text-sm font-medium text-rappen-charcoal hover:text-rappen-gold transition-colors"
					>
						← Zurück zur API-Übersicht
					</Link>
				</div>
			</Container>
		</section>
	);
}
