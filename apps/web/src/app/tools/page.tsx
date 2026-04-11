import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ToolIcon } from "@/components/tools/ToolIcon";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
	title: "Tools",
	description:
		"Schweizer Online-Tools für Lohn, Quellensteuer, QR-Rechnung, MWST und Compliance. Kostenlos testen, ohne Account.",
};

type Tier = 0 | 1 | 2;

type ToolSlug =
	| "qr-rechnung"
	| "lohnrechner"
	| "quellensteuer"
	| "mwst-rechner"
	| "arbeitszeit-check"
	| "lohngleichheit"
	| "vertrag-erstellen"
	| "grenzgaenger"
	| "firmen-check"
	| "personalverleih";

interface Tool {
	slug: ToolSlug;
	name: string;
	description: string;
	tier: Tier;
	category: "Buchhaltung" | "Personal" | "Compliance" | "Recht";
	legalBasis: string;
}

const tools: Tool[] = [
	{
		slug: "qr-rechnung",
		name: "QR-Rechnung",
		description: "Erstellen, validieren und parsen nach SIX QR-Bill Standard v2.3.",
		tier: 0,
		category: "Buchhaltung",
		legalBasis: "SIX QR-Bill v2.3",
	},
	{
		slug: "lohnrechner",
		name: "Lohnrechner",
		description: "AHV, ALV, BVG, UVG und Familienzulagen für alle 26 Kantone.",
		tier: 1,
		category: "Personal",
		legalBasis: "AHVG · BVG · UVG",
	},
	{
		slug: "quellensteuer",
		name: "Quellensteuer",
		description: "Offizielle ESTV-Tarife A–H mit Kirchensteuer und 13. Monatslohn.",
		tier: 1,
		category: "Personal",
		legalBasis: "DBG Art. 83–86",
	},
	{
		slug: "mwst-rechner",
		name: "MWST-Rechner",
		description: "Effektive und Saldosteuersatz-Methode mit Bezugsteuer-Berechnung.",
		tier: 2,
		category: "Buchhaltung",
		legalBasis: "MWSTG Art. 25",
	},
	{
		slug: "arbeitszeit-check",
		name: "Arbeitszeit-Check",
		description: "Compliance-Prüfung gegen das Arbeitsgesetz Art. 9–36.",
		tier: 2,
		category: "Compliance",
		legalBasis: "ArG Art. 9–36",
	},
	{
		slug: "lohngleichheit",
		name: "Lohngleichheit",
		description: "Logib-konforme Blinder-Oaxaca-Regression. Report in 30 Sekunden.",
		tier: 2,
		category: "Compliance",
		legalBasis: "GlG Art. 13",
	},
	{
		slug: "vertrag-erstellen",
		name: "Vertragsgenerator",
		description: "10 Schweizer Vertragstypen nach OR in DE/FR/IT.",
		tier: 2,
		category: "Recht",
		legalBasis: "OR Art. 319–827",
	},
	{
		slug: "grenzgaenger",
		name: "Grenzgänger",
		description: "DBA-Analyse, Telework-Schwellen und LEADS-Reporting.",
		tier: 2,
		category: "Personal",
		legalBasis: "VO 883/2004",
	},
	{
		slug: "firmen-check",
		name: "Firmen-Check",
		description: "Risiko-Score aus ZEFIX, SHAB und UID-Register.",
		tier: 2,
		category: "Compliance",
		legalBasis: "ZEFIX · SHAB",
	},
	{
		slug: "personalverleih",
		name: "Personalverleih",
		description: "AVG-Compliance mit SECO-Lizenz, Kaution und Equal Pay.",
		tier: 2,
		category: "Compliance",
		legalBasis: "AVG Art. 12–22",
	},
];

const tierLabels: Record<Tier, { label: string; className: string }> = {
	0: {
		label: "Kostenlos",
		className: "bg-emerald-50 text-emerald-700 border-emerald-200",
	},
	1: {
		label: "Gratis Account",
		className: "bg-blue-50 text-blue-700 border-blue-200",
	},
	2: {
		label: "Pro / Business",
		className: "bg-rappen-charcoal/5 text-rappen-charcoal border-rappen-charcoal/20",
	},
};

const categories = ["Buchhaltung", "Personal", "Compliance", "Recht"] as const;

export default function ToolsPage() {
	return (
		<>
			{/* Hero */}
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
							Sofort einsatzbereit im Browser. Drei Tools sind kostenlos — starten
							Sie ohne Anmeldung.
						</p>
					</div>
				</Container>
			</section>

			{/* Tools by category */}
			<section className="py-16">
				<Container size="wide">
					{categories.map((category) => {
						const categoryTools = tools.filter((t) => t.category === category);
						if (categoryTools.length === 0) return null;

						return (
							<div key={category} className="mb-12 last:mb-0">
								<h2 className="text-xs font-semibold uppercase tracking-wider text-rappen-gold mb-6">
									{category}
								</h2>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{categoryTools.map((tool) => {
										const tier = tierLabels[tool.tier];

										return (
											<Link
												key={tool.slug}
												href={`/tools/${tool.slug}`}
												className="group flex gap-4 rounded-xl border border-rappen-border bg-white p-6 transition-all hover:border-rappen-charcoal/40 hover:shadow-lg hover:shadow-black/5"
											>
												<ToolIcon slug={tool.slug} size="md" className="mt-0.5" />
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-2">
														<h3 className="text-base font-semibold text-rappen-charcoal group-hover:text-rappen-charcoal">
															{tool.name}
														</h3>
														<span
															className={cn(
																"inline-flex flex-shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
																tier.className,
															)}
														>
															{tier.label}
														</span>
													</div>
													<p className="mt-1.5 text-sm leading-relaxed text-rappen-muted">
														{tool.description}
													</p>
													<p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-rappen-muted/50">
														{tool.legalBasis}
													</p>
												</div>
											</Link>
										);
									})}
								</div>
							</div>
						);
					})}
				</Container>
			</section>
		</>
	);
}
