import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

const apis = [
	{
		number: "01",
		name: "Lohnberechnung",
		slug: "lohnrechner",
		description:
			"AHV, ALV, BVG, UVG, Quellensteuer und Familienzulagen für alle 26 Kantone. Inkl. 13. Monatslohn, Teilzeit, Bonus.",
		legal: "AHVG, BVG, UVG, FamZG",
	},
	{
		number: "02",
		name: "Quellensteuer",
		slug: "quellensteuer",
		description:
			"Tarife A–H mit allen kantonalen Eigenheiten, Kirchensteuer-Variante und 13.-Monatslohn-Anpassung.",
		legal: "DBG Art. 83–86, kantonale StG",
	},
	{
		number: "03",
		name: "QR-Rechnung",
		slug: "qr-rechnung",
		description:
			"Erstellen, validieren und parsen nach SIX QR-Bill Standard v2.3. Strukturierte Adressen, QRR/SCOR.",
		legal: "Swiss QR-Bill v2.3 (SIX Group)",
	},
	{
		number: "04",
		name: "MWST",
		slug: "mwst-rechner",
		description:
			"Effektive und Saldosteuersatz-Methode, 25 Branchen, Bezugsteuer für Auslandsdienstleistungen, Optimierungstipps.",
		legal: "MWSTG Art. 25, 28, 37, 45",
	},
	{
		number: "05",
		name: "Arbeitszeit",
		slug: "arbeitszeit-check",
		description:
			"ArG-Compliance: Höchstarbeitszeit, Pausen, Nacht-/Sonntagsarbeit, Ruhezeiten und Jugendschutz.",
		legal: "ArG Art. 9–36",
	},
	{
		number: "06",
		name: "Lohngleichheit",
		slug: "lohngleichheit",
		description:
			"Logib-Methodik mit Blinder-Oaxaca-Regression. CSV-Upload, GlG-konformer Report in 30 Sekunden.",
		legal: "GlG Art. 13, Logib (EBG)",
	},
	{
		number: "07",
		name: "Verträge",
		slug: "vertrag-erstellen",
		description:
			"10 Vertragstypen nach OR. Arbeitsvertrag, NDA, Gesellschaftervertrag, B2B-Dienstleistung – DE/FR/IT.",
		legal: "OR Art. 319–406, 620–827",
	},
	{
		number: "08",
		name: "Grenzgänger",
		slug: "grenzgaenger",
		description:
			"DBA-Abkommen mit DE/FR/IT/AT/LI, Telework-Schwellen, A1-Bescheinigung, LEADS-Reporting.",
		legal: "VO 883/2004, DBA-Abkommen",
	},
	{
		number: "09",
		name: "Firmen-Risiko",
		slug: "firmen-check",
		description:
			"Risiko-Score 0–100 aus ZEFIX, SHAB und UID-Register. Konkurssignale, VR-Wechsel, Kapitalveränderungen.",
		legal: "ZEFIX, SHAB, UID-Register",
	},
	{
		number: "10",
		name: "Personalverleih",
		slug: "personalverleih",
		description:
			"AVG-Compliance: SECO-Lizenz, Kaution, Einsatzdauer, Equal Pay, GAV-Mindestlöhne.",
		legal: "AVG Art. 12–22, AVV",
	},
];

export default function Home() {
	return (
		<>
			{/* ─── Hero ─────────────────────────────────────────────── */}
			<section className="relative overflow-hidden border-b border-rappen-border">
				{/* Subtle grid backdrop */}
				<div
					className="pointer-events-none absolute inset-0 opacity-[0.025]"
					style={{
						backgroundImage:
							"linear-gradient(to right, #0a0a0a 1px, transparent 1px), linear-gradient(to bottom, #0a0a0a 1px, transparent 1px)",
						backgroundSize: "48px 48px",
					}}
					aria-hidden="true"
				/>

				<Container size="wide">
					<div className="relative grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
						<div className="lg:col-span-7">
							<div className="inline-flex items-center gap-2 rounded-full border border-rappen-border bg-white/60 px-3 py-1.5 text-xs font-medium text-rappen-charcoal/80">
								<span className="h-1.5 w-1.5 rounded-full bg-rappen-gold" />
								10 APIs · 26 Kantone · 100% gesetzeskonform
							</div>

							<h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-rappen-charcoal lg:text-7xl">
								Präzision auf den
								<br />
								letzten <span className="text-rappen-gold">Rappen.</span>
							</h1>

							<p className="mt-6 max-w-xl text-lg leading-relaxed text-rappen-muted">
								Die API-Plattform für Schweizer Unternehmen. Lohn, Quellensteuer,
								QR-Rechnung, MWST, Verträge und Compliance – alles über eine
								Schnittstelle, mit verifizierten Werten für jeden Kanton.
							</p>

							<div className="mt-10 flex flex-wrap items-center gap-4">
								<Link href="/tools/qr-rechnung">
									<Button size="lg" variant="primary">
										Jetzt kostenlos testen
									</Button>
								</Link>
								<Link href="/docs">
									<Button size="lg" variant="ghost">
										API-Dokumentation →
									</Button>
								</Link>
							</div>

							<dl className="mt-14 grid grid-cols-3 gap-6 border-t border-rappen-border pt-8 max-w-md">
								<div>
									<dt className="text-xs uppercase tracking-wider text-rappen-muted">
										Kantone
									</dt>
									<dd className="mt-1 text-2xl font-semibold text-rappen-charcoal tabular-nums">
										26
									</dd>
								</div>
								<div>
									<dt className="text-xs uppercase tracking-wider text-rappen-muted">
										APIs
									</dt>
									<dd className="mt-1 text-2xl font-semibold text-rappen-charcoal tabular-nums">
										10
									</dd>
								</div>
								<div>
									<dt className="text-xs uppercase tracking-wider text-rappen-muted">
										Tests
									</dt>
									<dd className="mt-1 text-2xl font-semibold text-rappen-charcoal tabular-nums">
										170
									</dd>
								</div>
							</dl>
						</div>

						{/* Hero visual: stylized API call card */}
						<div className="hidden lg:col-span-5 lg:block">
							<div className="relative mx-auto max-w-md">
								<div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-rappen-gold/20 to-transparent blur-2xl" aria-hidden="true" />
								<div className="relative rounded-xl border border-rappen-border bg-rappen-charcoal p-1 shadow-2xl">
									<div className="flex items-center gap-2 px-4 py-3">
										<span className="h-3 w-3 rounded-full bg-white/20" />
										<span className="h-3 w-3 rounded-full bg-white/20" />
										<span className="h-3 w-3 rounded-full bg-white/20" />
										<span className="ml-3 font-mono text-xs text-rappen-muted-dark">
											api.rappen.ch/v1/payroll/calculate
										</span>
									</div>
									<div className="rounded-lg bg-black/40 p-5 font-mono text-[13px] leading-relaxed">
										<div className="text-rappen-muted-dark">// Request</div>
										<div className="mt-1 text-rappen-white">
											<span className="text-rappen-gold">POST</span> /v1/payroll/calculate
										</div>
										<div className="mt-3 text-rappen-muted-dark">{`{`}</div>
										<div className="pl-4 text-rappen-white">
											<span className="text-[#7dd3fc]">"canton"</span>: <span className="text-[#86efac]">"ZH"</span>,
										</div>
										<div className="pl-4 text-rappen-white">
											<span className="text-[#7dd3fc]">"gross_monthly"</span>: <span className="text-[#fcd34d]">8500</span>,
										</div>
										<div className="pl-4 text-rappen-white">
											<span className="text-[#7dd3fc]">"birth_year"</span>: <span className="text-[#fcd34d]">1990</span>
										</div>
										<div className="text-rappen-muted-dark">{`}`}</div>

										<div className="mt-5 text-rappen-muted-dark">// Response</div>
										<div className="mt-1 text-rappen-muted-dark">{`{`}</div>
										<div className="pl-4 text-rappen-white">
											<span className="text-[#7dd3fc]">"net_salary"</span>: <span className="text-[#86efac]">"7'026.65"</span>,
										</div>
										<div className="pl-4 text-rappen-white">
											<span className="text-[#7dd3fc]">"ahv_iv_eo"</span>: <span className="text-[#86efac]">"450.50"</span>,
										</div>
										<div className="pl-4 text-rappen-white">
											<span className="text-[#7dd3fc]">"bvg"</span>: <span className="text-[#86efac]">"260.30"</span>
										</div>
										<div className="text-rappen-muted-dark">{`}`}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Container>
			</section>

			{/* ─── 10 APIs grid ────────────────────────────────────── */}
			<section className="py-24" id="apis">
				<Container size="wide">
					<div className="mx-auto max-w-2xl text-center">
						<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
							Eine Plattform · Zehn Schnittstellen
						</p>
						<h2 className="mt-4 text-4xl font-semibold tracking-tight text-rappen-charcoal lg:text-5xl">
							Alles, was Schweizer Unternehmen brauchen
						</h2>
						<p className="mt-6 text-lg text-rappen-muted">
							Jede Berechnung basiert auf aktuellen Schweizer Rechtsgrundlagen.
							Jeder kantonale Wert verifiziert. Kein einziger Platzhalter.
						</p>
					</div>

					<div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-rappen-border bg-rappen-border md:grid-cols-2 lg:grid-cols-3">
						{apis.map((api) => (
							<Link
								key={api.slug}
								href={`/tools/${api.slug}`}
								className="group relative bg-rappen-cream p-8 hover:bg-white"
							>
								<div className="flex items-baseline gap-4">
									<span className="font-mono text-xs text-rappen-gold">{api.number}</span>
									<h3 className="text-lg font-semibold text-rappen-charcoal">
										{api.name}
									</h3>
								</div>
								<p className="mt-3 text-sm leading-relaxed text-rappen-muted">
									{api.description}
								</p>
								<p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-rappen-muted/70">
									{api.legal}
								</p>
								<div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-rappen-charcoal opacity-0 transition-opacity group-hover:opacity-100">
									Tool öffnen
									<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
										<path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</div>
							</Link>
						))}
					</div>
				</Container>
			</section>

			{/* ─── Trust / Why Rappen ──────────────────────────────── */}
			<section className="border-y border-rappen-border bg-white py-24">
				<Container size="wide">
					<div className="grid gap-16 lg:grid-cols-2">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
								Warum Rappen
							</p>
							<h2 className="mt-4 text-4xl font-semibold tracking-tight text-rappen-charcoal">
								Schweizer Recht.
								<br />
								Schweizer Präzision.
							</h2>
							<p className="mt-6 text-lg text-rappen-muted">
								Treuhänder, Lohnbuchhalter und Software-Entwickler verlassen sich
								auf Rappen, weil jede einzelne Berechnung gegen die offiziellen
								Quellen geprüft ist.
							</p>
						</div>

						<dl className="space-y-10">
							{[
								{
									title: "Verifiziert gegen offizielle Quellen",
									body: "BSV, ESTV, SECO, kantonale Steuerverwaltungen. Jeder Wert mit Quellenangabe dokumentiert.",
								},
								{
									title: "Decimal.js statt Floats",
									body: "Keine Rundungsfehler. Alle CHF-Beträge auf 5 Rappen gerundet, wie es der Schweizer Standard verlangt.",
								},
								{
									title: "Über 170 automatisierte Tests",
									body: "Jede API wird gegen Edge Cases getestet: Teilzeit, 13. Monatslohn, Kantonswechsel, BVG-Schwellen.",
								},
								{
									title: "Made in Switzerland",
									body: "Entwickelt in der Schweiz. Hosting in der EU. Daten bleiben dort, wo sie hingehören.",
								},
							].map((item) => (
								<div key={item.title} className="border-l-2 border-rappen-gold pl-6">
									<dt className="text-base font-semibold text-rappen-charcoal">
										{item.title}
									</dt>
									<dd className="mt-2 text-sm text-rappen-muted">{item.body}</dd>
								</div>
							))}
						</dl>
					</div>
				</Container>
			</section>

			{/* ─── CTA ─────────────────────────────────────────────── */}
			<section className="py-24">
				<Container size="default">
					<div className="rounded-2xl bg-rappen-charcoal px-8 py-16 text-center lg:px-16 lg:py-20">
						<h2 className="text-3xl font-semibold tracking-tight text-rappen-white lg:text-5xl">
							Bereit für präzise Berechnungen?
						</h2>
						<p className="mx-auto mt-5 max-w-2xl text-lg text-rappen-muted-dark">
							Starten Sie kostenlos mit der QR-Rechnung – ohne Account, ohne Karte.
							Erstellen Sie einen Gratis-Account für Lohn- und Quellensteuer-Tools.
						</p>
						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<Link href="/tools/qr-rechnung">
								<Button size="lg" variant="secondary">
									Jetzt kostenlos testen
								</Button>
							</Link>
							<Link href="/pricing">
								<Button
									size="lg"
									variant="ghost"
									className="text-rappen-white hover:bg-white/10"
								>
									Preise ansehen →
								</Button>
							</Link>
						</div>
					</div>
				</Container>
			</section>
		</>
	);
}
