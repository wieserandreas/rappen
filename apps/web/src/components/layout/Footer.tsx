import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Container } from "./Container";

const footerSections = [
	{
		title: "Produkt",
		links: [
			{ href: "/tools", label: "Tools" },
			{ href: "/pricing", label: "Preise" },
			{ href: "/docs", label: "API-Dokumentation" },
			{ href: "/changelog", label: "Changelog" },
		],
	},
	{
		title: "Tools",
		links: [
			{ href: "/tools/qr-rechnung", label: "QR-Rechnung" },
			{ href: "/tools/lohnrechner", label: "Lohnrechner" },
			{ href: "/tools/quellensteuer", label: "Quellensteuer" },
			{ href: "/tools/mwst-rechner", label: "MWST-Rechner" },
		],
	},
	{
		title: "Unternehmen",
		links: [
			{ href: "/about", label: "Über uns" },
			{ href: "/contact", label: "Kontakt" },
			{ href: "/blog", label: "Blog" },
		],
	},
	{
		title: "Rechtliches",
		links: [
			{ href: "/legal/agb", label: "AGB" },
			{ href: "/legal/datenschutz", label: "Datenschutz" },
			{ href: "/legal/impressum", label: "Impressum" },
		],
	},
] as const;

export function Footer() {
	return (
		<footer className="mt-24 border-t border-rappen-border bg-rappen-charcoal text-rappen-white">
			<Container size="wide">
				<div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-6">
					<div className="lg:col-span-2">
						<Logo size="md" mark="light" />
						<p className="mt-4 max-w-xs text-sm leading-relaxed text-rappen-muted-dark">
							Präzision auf den letzten Rappen. Die API-Plattform für Schweizer
							Unternehmen.
						</p>
						<p className="mt-6 text-xs text-rappen-muted-dark">
							Made in Switzerland · Hosted in EU
						</p>
					</div>

					{footerSections.map((section) => (
						<div key={section.title}>
							<h3 className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
								{section.title}
							</h3>
							<ul className="mt-4 space-y-3">
								{section.links.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-rappen-muted-dark hover:text-rappen-white"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 py-8 sm:flex-row sm:items-center">
					<p className="text-xs text-rappen-muted-dark">
						© {new Date().getFullYear()} Rappen. Alle Rechte vorbehalten.
					</p>
					<p className="text-xs text-rappen-muted-dark">
						Alle Berechnungen basieren auf aktuellen Schweizer Rechtsgrundlagen.
					</p>
				</div>
			</Container>
		</footer>
	);
}
