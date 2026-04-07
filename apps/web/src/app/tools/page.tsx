import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
	title: "Tools",
	description:
		"Schweizer Online-Tools für Lohn, Quellensteuer, QR-Rechnung, MWST und Compliance. Kostenlos testen, ohne Account.",
};

type Tier = 0 | 1 | 2;

interface Tool {
	slug: string;
	name: string;
	description: string;
	tier: Tier;
	available: boolean;
	category: "Buchhaltung" | "Personal" | "Compliance" | "Recht";
}

const tools: Tool[] = [
	{
		slug: "qr-rechnung",
		name: "QR-Rechnung",
		description:
			"Erstellen, validieren und parsen Sie Schweizer QR-Rechnungen nach SIX-Standard v2.3.",
		tier: 0,
		available: true,
		category: "Buchhaltung",
	},
	{
		slug: "lohnrechner",
		name: "Lohnrechner",
		description:
			"Vollständige Lohnabrechnung mit AHV, ALV, BVG, UVG und Familienzulagen für alle 26 Kantone.",
		tier: 1,
		available: true,
		category: "Personal",
	},
	{
		slug: "quellensteuer",
		name: "Quellensteuer",
		description:
			"Berechnen Sie die Quellensteuer mit Tarifen A–H, Kirchensteuer und 13.-Monatslohn-Anpassung.",
		tier: 1,
		available: true,
		category: "Personal",
	},
	{
		slug: "mwst-rechner",
		name: "MWST-Rechner",
		description:
			"Effektive und Saldosteuersatz-Methode mit Optimierungstipps und Bezugsteuer-Berechnung.",
		tier: 2,
		available: true,
		category: "Buchhaltung",
	},
	{
		slug: "arbeitszeit-check",
		name: "Arbeitszeit-Check",
		description:
			"Prüfen Sie Zeiterfassungsdaten gegen das Schweizer Arbeitsgesetz (ArG).",
		tier: 2,
		available: true,
		category: "Compliance",
	},
	{
		slug: "lohngleichheit",
		name: "Lohngleichheit",
		description:
			"Logib-konforme Lohngleichheitsanalyse per CSV-Upload. GlG-Report in 30 Sekunden.",
		tier: 2,
		available: true,
		category: "Compliance",
	},
	{
		slug: "vertrag-erstellen",
		name: "Vertragsgenerator",
		description:
			"10 Schweizer Vertragstypen nach OR. Schritt-für-Schritt-Wizard, DOCX/PDF-Download.",
		tier: 2,
		available: true,
		category: "Recht",
	},
	{
		slug: "grenzgaenger",
		name: "Grenzgänger",
		description:
			"DBA-Analyse mit DE/FR/IT/AT/LI, Telework-Schwellen und LEADS-Reporting.",
		tier: 2,
		available: true,
		category: "Personal",
	},
	{
		slug: "firmen-check",
		name: "Firmen-Check",
		description:
			"Risiko-Score aus ZEFIX, SHAB und UID-Register für jedes Schweizer Unternehmen.",
		tier: 2,
		available: true,
		category: "Compliance",
	},
	{
		slug: "personalverleih",
		name: "Personalverleih",
		description:
			"AVG-Compliance-Check mit SECO-Lizenz, Kaution und Equal-Pay-Prüfung.",
		tier: 2,
		available: true,
		category: "Compliance",
	},
];

const tierLabels: Record<Tier, { label: string; className: string }> = {
	0: {
		label: "Ohne Account",
		className: "bg-emerald-50 text-emerald-700 border-emerald-200",
	},
	1: {
		label: "Gratis Account",
		className: "bg-blue-50 text-blue-700 border-blue-200",
	},
	2: {
		label: "Bezahlt",
		className: "bg-amber-50 text-amber-800 border-amber-200",
	},
};

export default function ToolsPage() {
	return (
		<>
			<section className="border-b border-rappen-border py-20">
				<Container size="wide">
					<div className="mx-auto max-w-2xl text-center">
						<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
							Tools
						</p>
						<h1 className="mt-4 text-5xl font-semibold tracking-tight text-rappen-charcoal lg:text-6xl">
							Zehn Tools, eine Plattform
						</h1>
						<p className="mt-6 text-lg text-rappen-muted">
							Sofort einsatzbereit im Browser. Drei Tools sind kostenlos – starten Sie
							ohne Anmeldung.
						</p>
					</div>
				</Container>
			</section>

			<section className="py-16">
				<Container size="wide">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{tools.map((tool) => {
							const tier = tierLabels[tool.tier];
							const content = (
								<>
									<div className="flex items-start justify-between gap-3">
										<h2 className="text-lg font-semibold text-rappen-charcoal">
											{tool.name}
										</h2>
										<span
											className={cn(
												"inline-flex flex-shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
												tier.className,
											)}
										>
											{tier.label}
										</span>
									</div>
									<p className="mt-3 text-sm leading-relaxed text-rappen-muted">
										{tool.description}
									</p>
									<div className="mt-6 flex items-center justify-between">
										<span className="text-xs uppercase tracking-wider text-rappen-muted/70">
											{tool.category}
										</span>
										{tool.available ? (
											<span className="inline-flex items-center gap-1.5 text-sm font-medium text-rappen-charcoal">
												Öffnen
												<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
													<path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</span>
										) : (
											<span className="text-xs text-rappen-muted/70">In Kürze</span>
										)}
									</div>
								</>
							);

							return tool.available ? (
								<Link
									key={tool.slug}
									href={`/tools/${tool.slug}`}
									className="group block rounded-xl border border-rappen-border bg-white p-7 hover:border-rappen-charcoal hover:shadow-md"
								>
									{content}
								</Link>
							) : (
								<div
									key={tool.slug}
									className="rounded-xl border border-rappen-border bg-white p-7 opacity-60"
								>
									{content}
								</div>
							);
						})}
					</div>
				</Container>
			</section>
		</>
	);
}
