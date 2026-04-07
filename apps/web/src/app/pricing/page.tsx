import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
	title: "Preise",
	description:
		"Transparente Preise für alle Unternehmensgrössen. Von gratis bis Enterprise. Alle 10 Schweizer APIs.",
};

interface Plan {
	name: string;
	tagline: string;
	price: { amount: number | "Gratis"; period?: string };
	highlight?: boolean;
	features: string[];
	ctaLabel: string;
	ctaHref: string;
	apis: string;
}

const plans: Plan[] = [
	{
		name: "Free",
		tagline: "Zum Ausprobieren",
		price: { amount: "Gratis" },
		apis: "3 von 10 APIs",
		features: [
			"QR-Rechnung (unbegrenzt)",
			"Lohnrechner (10 Berechnungen / Tag)",
			"Quellensteuer (10 Berechnungen / Tag)",
			"Web-Interface",
			"E-Mail-Support",
		],
		ctaLabel: "Kostenlos starten",
		ctaHref: "/register",
	},
	{
		name: "Starter",
		tagline: "Für kleine Treuhänder",
		price: { amount: 149, period: "/ Monat" },
		apis: "3 APIs nach Wahl",
		features: [
			"500 API-Calls / Monat",
			"API-Key + Dashboard",
			"Usage-Tracking",
			"E-Mail-Support",
			"Inklusive: QR-Rechnung, Lohn, Quellensteuer",
		],
		ctaLabel: "Plan wählen",
		ctaHref: "/register?plan=starter",
	},
	{
		name: "Business",
		tagline: "Für wachsende Unternehmen",
		price: { amount: 399, period: "/ Monat" },
		highlight: true,
		apis: "6 APIs nach Wahl",
		features: [
			"5'000 API-Calls / Monat",
			"File-Upload (CSV / Excel)",
			"Vertragsgenerator (DOCX / PDF)",
			"Lohngleichheitsanalyse",
			"Priority E-Mail-Support",
			"Webhook-Notifications",
		],
		ctaLabel: "Plan wählen",
		ctaHref: "/register?plan=business",
	},
	{
		name: "Professional",
		tagline: "Für Software-Häuser",
		price: { amount: 699, period: "/ Monat" },
		apis: "Alle 10 APIs",
		features: [
			"20'000 API-Calls / Monat",
			"Alle 10 APIs unbegrenzt nutzen",
			"Firmen-Risiko-Score (ZEFIX/SHAB)",
			"Grenzgänger-LEADS-Export",
			"Personalverleih-Compliance",
			"Priority Support (24h SLA)",
		],
		ctaLabel: "Plan wählen",
		ctaHref: "/register?plan=professional",
	},
];

export default function PricingPage() {
	return (
		<>
			<section className="border-b border-rappen-border py-20">
				<Container size="wide">
					<div className="mx-auto max-w-2xl text-center">
						<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
							Preise
						</p>
						<h1 className="mt-4 text-5xl font-semibold tracking-tight text-rappen-charcoal lg:text-6xl">
							Transparent. Schweizerisch.
						</h1>
						<p className="mt-6 text-lg text-rappen-muted">
							Vom kostenlosen Test bis zur Enterprise-Integration. Keine versteckten
							Gebühren, keine Setup-Kosten. Monatlich kündbar.
						</p>
					</div>
				</Container>
			</section>

			<section className="py-20">
				<Container size="wide">
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
						{plans.map((plan) => (
							<div
								key={plan.name}
								className={cn(
									"relative flex flex-col rounded-xl border bg-white p-8",
									plan.highlight
										? "border-rappen-charcoal shadow-xl ring-1 ring-rappen-charcoal"
										: "border-rappen-border",
								)}
							>
								{plan.highlight && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2">
										<span className="inline-flex items-center rounded-full bg-rappen-gold px-3 py-1 text-xs font-semibold text-rappen-charcoal">
											Beliebteste Wahl
										</span>
									</div>
								)}

								<div>
									<h2 className="text-xl font-semibold text-rappen-charcoal">
										{plan.name}
									</h2>
									<p className="mt-1 text-sm text-rappen-muted">{plan.tagline}</p>
								</div>

								<div className="mt-8">
									{plan.price.amount === "Gratis" ? (
										<div className="text-4xl font-semibold text-rappen-charcoal tabular-nums">
											Gratis
										</div>
									) : (
										<div className="flex items-baseline gap-1">
											<span className="text-2xl font-medium text-rappen-muted">CHF</span>
											<span className="text-5xl font-semibold text-rappen-charcoal tabular-nums">
												{plan.price.amount}
											</span>
											<span className="text-sm text-rappen-muted">{plan.price.period}</span>
										</div>
									)}
									<p className="mt-2 text-xs font-semibold uppercase tracking-wider text-rappen-gold">
										{plan.apis}
									</p>
								</div>

								<ul className="mt-8 flex-1 space-y-3">
									{plan.features.map((feature) => (
										<li key={feature} className="flex items-start gap-2.5 text-sm text-rappen-charcoal">
											<svg
												className="mt-0.5 h-4 w-4 flex-shrink-0 text-rappen-gold"
												viewBox="0 0 16 16"
												fill="none"
												aria-hidden="true"
											>
												<path
													d="M3 8L6.5 11.5L13 5"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
											{feature}
										</li>
									))}
								</ul>

								<div className="mt-8">
									<Link href={plan.ctaHref}>
										<Button
											variant={plan.highlight ? "primary" : "outline"}
											className="w-full"
										>
											{plan.ctaLabel}
										</Button>
									</Link>
								</div>
							</div>
						))}
					</div>

					<div className="mt-16 rounded-xl border border-rappen-border bg-white p-8 text-center">
						<h3 className="text-xl font-semibold text-rappen-charcoal">
							Enterprise
						</h3>
						<p className="mt-2 text-sm text-rappen-muted">
							Unbegrenzte API-Calls, dedizierter Support, individuelles SLA und
							Custom-Integrationen.
						</p>
						<div className="mt-6">
							<Link href="/contact">
								<Button variant="outline">Kontakt aufnehmen</Button>
							</Link>
						</div>
					</div>
				</Container>
			</section>

			{/* FAQ */}
			<section className="border-t border-rappen-border bg-white py-20">
				<Container size="narrow">
					<h2 className="text-center text-3xl font-semibold tracking-tight text-rappen-charcoal">
						Häufige Fragen
					</h2>
					<dl className="mt-12 space-y-8">
						{[
							{
								q: "Sind die Berechnungen rechtsgültig?",
								a: "Alle Berechnungen basieren auf den aktuellen Schweizer Rechtsgrundlagen (BSV, ESTV, SECO, kantonale Steuerverwaltungen). Die Resultate dienen als Berechnungsgrundlage und ersetzen keine Beratung durch eine zugelassene Fachperson.",
							},
							{
								q: "Wie aktuell sind die Tarife?",
								a: "Wir aktualisieren AHV/BVG/ALV-Sätze jährlich im Januar, Quellensteuertarife sobald die Kantone publizieren, und MWST-Sätze bei jeder Änderung. Jede Datenquelle ist im Code mit Quellenangabe dokumentiert.",
							},
							{
								q: "Werden alle 26 Kantone unterstützt?",
								a: "Ja. Lohnberechnung, FAK, Sozialversicherungen und MWST sind für alle 26 Kantone vollständig implementiert. Quellensteuertarife werden laufend ergänzt.",
							},
							{
								q: "Kann ich den Plan jederzeit wechseln?",
								a: "Ja. Sie können jederzeit upgraden oder downgraden. Bei einem Upgrade wird die Differenz pro rata verrechnet. Bei einem Downgrade gilt der neue Preis ab dem nächsten Abrechnungsmonat.",
							},
							{
								q: "Wo werden meine Daten gespeichert?",
								a: "Alle Daten werden auf Servern in der EU gehostet. Berechnungs-Inputs werden nicht gespeichert, ausser Sie aktivieren explizit die Audit-Log-Funktion für Ihren Account.",
							},
						].map((item) => (
							<div key={item.q}>
								<dt className="text-base font-semibold text-rappen-charcoal">
									{item.q}
								</dt>
								<dd className="mt-2 text-sm leading-relaxed text-rappen-muted">
									{item.a}
								</dd>
							</div>
						))}
					</dl>
				</Container>
			</section>
		</>
	);
}
