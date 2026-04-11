import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
	title: "API-Dokumentation",
	description:
		"Integrieren Sie Schweizer Lohn-, Steuer- und Compliance-Berechnungen in Ihre Software. REST API mit JSON-Antworten.",
};

const apis = [
	{
		number: "01",
		name: "Lohnberechnung",
		slug: "lohnberechnung",
		endpoint: "/v1/payroll/calculate",
		description:
			"Brutto-Netto-Berechnung inkl. AHV, ALV, BVG, UVG, Quellensteuer und Familienzulagen.",
	},
	{
		number: "02",
		name: "Quellensteuer",
		slug: "quellensteuer",
		endpoint: "/v1/withholding-tax/calculate",
		description:
			"Tarife A-H, Kirchensteuer, alle 26 Kantone. Monatlich und jährlich.",
	},
	{
		number: "03",
		name: "QR-Rechnung",
		slug: "qr-rechnung",
		endpoint: "/v1/qr-bill/generate",
		description:
			"Erstellen, validieren und parsen von Swiss QR-Bills nach SIX Standard v2.3.",
	},
	{
		number: "04",
		name: "MWST",
		slug: "mwst",
		endpoint: "/v1/vat/calculate",
		description:
			"Effektive Methode, Saldosteuersatz, Bezugsteuer. Alle Branchen und Sondersätze.",
	},
	{
		number: "05",
		name: "Arbeitszeit",
		slug: "arbeitszeit",
		endpoint: "/v1/working-time/validate",
		description:
			"ArG-Compliance-Check: Höchstarbeitszeit, Pausen, Nacht-/Sonntagsarbeit, Ruhezeiten.",
	},
	{
		number: "06",
		name: "Lohngleichheit",
		slug: "lohngleichheit",
		endpoint: "/v1/pay-equity/analyze",
		description:
			"Logib-Methodik, Blinder-Oaxaca-Regression. CSV-Upload, GlG-konformer Report.",
	},
	{
		number: "07",
		name: "Verträge",
		slug: "vertraege",
		endpoint: "/v1/contracts/generate",
		description:
			"10 Vertragstypen nach OR. Arbeitsvertrag, NDA, Gesellschaftervertrag in DE/FR/IT.",
	},
	{
		number: "08",
		name: "Grenzgänger",
		slug: "grenzgaenger",
		endpoint: "/v1/cross-border/calculate",
		description:
			"DBA-Abkommen DE/FR/IT/AT/LI, Telework-Schwellen, A1-Bescheinigung.",
	},
	{
		number: "09",
		name: "Firmen-Risiko",
		slug: "firmen-risiko",
		endpoint: "/v1/company-risk/score",
		description:
			"Risiko-Score 0-100 aus ZEFIX, SHAB und UID-Register. Konkurssignale, VR-Wechsel.",
	},
	{
		number: "10",
		name: "Personalverleih",
		slug: "personalverleih",
		endpoint: "/v1/staffing/validate",
		description:
			"AVG-Compliance: SECO-Lizenz, Kaution, Einsatzdauer, Equal Pay, GAV-Mindestlöhne.",
	},
];

const rateLimits = [
	{ tier: "Free", limit: "100 Requests / Tag", burst: "10 / Min" },
	{ tier: "Starter", limit: "10'000 Requests / Monat", burst: "60 / Min" },
	{ tier: "Professional", limit: "100'000 Requests / Monat", burst: "300 / Min" },
	{ tier: "Enterprise", limit: "Unbegrenzt", burst: "Individuell" },
];

export default function DocsPage() {
	return (
		<>
			{/* Hero */}
			<section className="border-b border-rappen-border bg-white py-16 lg:py-20">
				<Container size="wide">
					<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
						Entwickler
					</p>
					<h1 className="mt-4 text-4xl font-semibold tracking-tight text-rappen-charcoal lg:text-5xl">
						API-Dokumentation
					</h1>
					<p className="mt-4 max-w-2xl text-lg text-rappen-muted">
						Integrieren Sie Schweizer Lohn-, Steuer- und Compliance-Berechnungen
						in Ihre Software.
					</p>

					{/* Base URL */}
					<div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-rappen-border bg-rappen-cream px-5 py-3">
						<span className="text-xs font-semibold uppercase tracking-wider text-rappen-muted">
							Base URL
						</span>
						<code className="font-mono text-[15px] font-medium text-rappen-charcoal">
							https://api.rappen.ch/v1/
						</code>
					</div>
				</Container>
			</section>

			{/* Authentication */}
			<section className="border-b border-rappen-border py-16 lg:py-20">
				<Container size="wide">
					<div className="grid gap-12 lg:grid-cols-2">
						<div>
							<h2 className="text-2xl font-semibold tracking-tight text-rappen-charcoal">
								Authentifizierung
							</h2>
							<p className="mt-4 text-[15px] leading-relaxed text-rappen-muted">
								Alle API-Anfragen erfordern einen gültigen API-Key. Senden Sie
								Ihren Key im <code className="rounded bg-rappen-cream px-1.5 py-0.5 font-mono text-sm text-rappen-charcoal">Authorization</code> Header
								als Bearer Token. API-Keys können im Dashboard unter
								Einstellungen erstellt und verwaltet werden.
							</p>
							<p className="mt-4 text-[15px] leading-relaxed text-rappen-muted">
								Für Testanfragen steht ein Sandbox-Key zur Verfügung, der
								Berechnungen mit Testdaten zurückgibt.
							</p>
						</div>
						<div>
							<div className="rounded-xl border border-rappen-border bg-rappen-charcoal p-1 shadow-lg">
								<div className="flex items-center gap-2 px-4 py-2.5">
									<span className="h-2.5 w-2.5 rounded-full bg-white/20" />
									<span className="h-2.5 w-2.5 rounded-full bg-white/20" />
									<span className="h-2.5 w-2.5 rounded-full bg-white/20" />
									<span className="ml-3 font-mono text-xs text-rappen-muted-dark">
										Authentifizierung
									</span>
								</div>
								<div className="rounded-lg bg-black/40 p-5 font-mono text-[13px] leading-relaxed">
									<div className="text-rappen-muted-dark"># Header</div>
									<div className="mt-2 text-rappen-white">
										<span className="text-[#7dd3fc]">Authorization</span>
										<span className="text-rappen-muted-dark">:</span>{" "}
										<span className="text-[#86efac]">
											Bearer rp_live_sk_...
										</span>
									</div>
									<div className="mt-5 text-rappen-muted-dark"># Sandbox</div>
									<div className="mt-2 text-rappen-white">
										<span className="text-[#7dd3fc]">Authorization</span>
										<span className="text-rappen-muted-dark">:</span>{" "}
										<span className="text-[#86efac]">
											Bearer rp_test_sk_...
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Container>
			</section>

			{/* API Quick Links Grid */}
			<section className="border-b border-rappen-border py-16 lg:py-20">
				<Container size="wide">
					<h2 className="text-2xl font-semibold tracking-tight text-rappen-charcoal">
						API-Referenz
					</h2>
					<p className="mt-3 text-[15px] text-rappen-muted">
						10 Endpunkte. Alle 26 Kantone. Eine konsistente JSON-Schnittstelle.
					</p>

					<div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-rappen-border bg-rappen-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
						{apis.map((api) => (
							<Link
								key={api.slug}
								href="#"
								className="group flex flex-col bg-white p-6 hover:bg-rappen-cream/50"
							>
								<div className="flex items-baseline gap-3">
									<span className="font-mono text-xs text-rappen-gold">
										{api.number}
									</span>
									<h3 className="text-[15px] font-semibold text-rappen-charcoal">
										{api.name}
									</h3>
								</div>
								<code className="mt-2 block truncate font-mono text-xs text-rappen-muted">
									{api.endpoint}
								</code>
								<p className="mt-3 flex-1 text-xs leading-relaxed text-rappen-muted">
									{api.description}
								</p>
								<span className="mt-4 text-xs font-medium text-rappen-charcoal opacity-0 transition-opacity group-hover:opacity-100">
									Dokumentation &rarr;
								</span>
							</Link>
						))}
					</div>
				</Container>
			</section>

			{/* Getting Started */}
			<section className="border-b border-rappen-border py-16 lg:py-20">
				<Container size="wide">
					<div className="grid gap-12 lg:grid-cols-2">
						<div>
							<h2 className="text-2xl font-semibold tracking-tight text-rappen-charcoal">
								Schnellstart
							</h2>
							<p className="mt-4 text-[15px] leading-relaxed text-rappen-muted">
								In wenigen Minuten zur ersten API-Anfrage. Erstellen Sie einen
								Account, generieren Sie einen API-Key und senden Sie Ihre erste
								Anfrage.
							</p>
							<ol className="mt-6 space-y-4">
								{[
									"Account erstellen und API-Key generieren",
									"Key im Authorization-Header mitschicken",
									"POST-Request an den gewünschten Endpunkt senden",
									"JSON-Antwort mit berechneten Werten empfangen",
								].map((step, i) => (
									<li key={step} className="flex gap-3">
										<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rappen-charcoal font-mono text-xs font-medium text-rappen-white">
											{i + 1}
										</span>
										<span className="text-[15px] text-rappen-muted">{step}</span>
									</li>
								))}
							</ol>
						</div>
						<div>
							<div className="rounded-xl border border-rappen-border bg-rappen-charcoal p-1 shadow-lg">
								<div className="flex items-center gap-2 px-4 py-2.5">
									<span className="h-2.5 w-2.5 rounded-full bg-white/20" />
									<span className="h-2.5 w-2.5 rounded-full bg-white/20" />
									<span className="h-2.5 w-2.5 rounded-full bg-white/20" />
									<span className="ml-3 font-mono text-xs text-rappen-muted-dark">
										cURL
									</span>
								</div>
								<div className="rounded-lg bg-black/40 p-5 font-mono text-[13px] leading-relaxed">
									<div className="text-rappen-muted-dark">
										# Lohnberechnung fuer Kanton Zuerich
									</div>
									<div className="mt-2 text-rappen-white">
										<span className="text-rappen-gold">curl</span> -X POST \
									</div>
									<div className="pl-4 text-rappen-white">
										https://api.rappen.ch/v1/payroll/calculate \
									</div>
									<div className="pl-4 text-rappen-white">
										-H{" "}
										<span className="text-[#86efac]">
											{'"'}Authorization: Bearer rp_live_sk_...{'"'}
										</span>{" "}
										\
									</div>
									<div className="pl-4 text-rappen-white">
										-H{" "}
										<span className="text-[#86efac]">
											{'"'}Content-Type: application/json{'"'}
										</span>{" "}
										\
									</div>
									<div className="pl-4 text-rappen-white">
										-d{" "}
										<span className="text-[#86efac]">
											{"'"}
											{`{"canton":"ZH","gross_monthly":8500,"birth_year":1990}`}
											{"'"}
										</span>
									</div>
								</div>
							</div>

							{/* Response */}
							<div className="mt-4 rounded-xl border border-rappen-border bg-rappen-charcoal p-1 shadow-lg">
								<div className="flex items-center gap-2 px-4 py-2.5">
									<span className="h-2.5 w-2.5 rounded-full bg-[#86efac]" />
									<span className="ml-3 font-mono text-xs text-rappen-muted-dark">
										200 OK
									</span>
								</div>
								<div className="rounded-lg bg-black/40 p-5 font-mono text-[13px] leading-relaxed">
									<div className="text-rappen-muted-dark">{`{`}</div>
									<div className="pl-4 text-rappen-white">
										<span className="text-[#7dd3fc]">{'"'}net_salary{'"'}</span>
										<span className="text-rappen-muted-dark">:</span>{" "}
										<span className="text-[#fcd34d]">7026.65</span>,
									</div>
									<div className="pl-4 text-rappen-white">
										<span className="text-[#7dd3fc]">{'"'}ahv_iv_eo{'"'}</span>
										<span className="text-rappen-muted-dark">:</span>{" "}
										<span className="text-[#fcd34d]">450.50</span>,
									</div>
									<div className="pl-4 text-rappen-white">
										<span className="text-[#7dd3fc]">{'"'}alv{'"'}</span>
										<span className="text-rappen-muted-dark">:</span>{" "}
										<span className="text-[#fcd34d]">93.50</span>,
									</div>
									<div className="pl-4 text-rappen-white">
										<span className="text-[#7dd3fc]">{'"'}bvg{'"'}</span>
										<span className="text-rappen-muted-dark">:</span>{" "}
										<span className="text-[#fcd34d]">260.30</span>,
									</div>
									<div className="pl-4 text-rappen-white">
										<span className="text-[#7dd3fc]">{'"'}canton{'"'}</span>
										<span className="text-rappen-muted-dark">:</span>{" "}
										<span className="text-[#86efac]">{'"'}ZH{'"'}</span>,
									</div>
									<div className="pl-4 text-rappen-white">
										<span className="text-[#7dd3fc]">
											{'"'}currency{'"'}
										</span>
										<span className="text-rappen-muted-dark">:</span>{" "}
										<span className="text-[#86efac]">{'"'}CHF{'"'}</span>
									</div>
									<div className="text-rappen-muted-dark">{`}`}</div>
								</div>
							</div>
						</div>
					</div>
				</Container>
			</section>

			{/* Rate Limiting */}
			<section className="py-16 lg:py-20">
				<Container size="wide">
					<h2 className="text-2xl font-semibold tracking-tight text-rappen-charcoal">
						Rate Limits
					</h2>
					<p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-rappen-muted">
						Anfragen werden pro API-Key limitiert. Bei Ueberschreitung
						erhalten Sie einen{" "}
						<code className="rounded bg-rappen-cream px-1.5 py-0.5 font-mono text-sm text-rappen-charcoal">
							429 Too Many Requests
						</code>{" "}
						Status. Die Response-Header{" "}
						<code className="rounded bg-rappen-cream px-1.5 py-0.5 font-mono text-sm text-rappen-charcoal">
							X-RateLimit-Remaining
						</code>{" "}
						und{" "}
						<code className="rounded bg-rappen-cream px-1.5 py-0.5 font-mono text-sm text-rappen-charcoal">
							X-RateLimit-Reset
						</code>{" "}
						zeigen den aktuellen Stand.
					</p>

					<div className="mt-10 overflow-hidden rounded-xl border border-rappen-border">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-rappen-border bg-rappen-cream/60">
									<th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-rappen-muted">
										Tier
									</th>
									<th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-rappen-muted">
										Kontingent
									</th>
									<th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-rappen-muted">
										Burst
									</th>
								</tr>
							</thead>
							<tbody>
								{rateLimits.map((rl, i) => (
									<tr
										key={rl.tier}
										className={
											i < rateLimits.length - 1
												? "border-b border-rappen-border"
												: ""
										}
									>
										<td className="px-6 py-4 text-[15px] font-medium text-rappen-charcoal">
											{rl.tier}
										</td>
										<td className="px-6 py-4 font-mono text-sm text-rappen-muted">
											{rl.limit}
										</td>
										<td className="px-6 py-4 font-mono text-sm text-rappen-muted">
											{rl.burst}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Help link */}
					<div className="mt-16 rounded-xl border border-rappen-border bg-white p-8 text-center">
						<h3 className="text-lg font-semibold text-rappen-charcoal">
							Brauchen Sie Hilfe?
						</h3>
						<p className="mt-2 text-sm text-rappen-muted">
							Unser Team hilft Ihnen bei der Integration. Schreiben Sie uns an{" "}
							<a
								href="mailto:support@rappen.ch"
								className="font-medium text-rappen-charcoal hover:text-rappen-gold"
							>
								support@rappen.ch
							</a>{" "}
							oder besuchen Sie unsere{" "}
							<Link
								href="/contact"
								className="font-medium text-rappen-charcoal hover:text-rappen-gold"
							>
								Kontaktseite
							</Link>
							.
						</p>
					</div>
				</Container>
			</section>
		</>
	);
}
