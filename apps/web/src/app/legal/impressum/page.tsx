import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
	title: "Impressum",
};

export default function ImpressumPage() {
	return (
		<section className="py-16">
			<Container size="narrow">
				<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
					Rechtliches
				</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-tight text-rappen-charcoal">
					Impressum
				</h1>

				<div className="mt-10 space-y-8 text-[15px] leading-relaxed text-rappen-charcoal/90">
					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">Betreiber</h2>
						<address className="mt-3 not-italic space-y-1">
							<p className="font-semibold">Rappen</p>
							<p>Zürich, Schweiz</p>
						</address>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">Kontakt</h2>
						<div className="mt-3 space-y-2">
							<p>
								Allgemein:{" "}
								<a href="mailto:hello@rappen.ch" className="underline hover:text-rappen-charcoal">
									hello@rappen.ch
								</a>
							</p>
							<p>
								Technischer Support:{" "}
								<a href="mailto:support@rappen.ch" className="underline hover:text-rappen-charcoal">
									support@rappen.ch
								</a>
							</p>
							<p>
								Datenschutz:{" "}
								<a href="mailto:datenschutz@rappen.ch" className="underline hover:text-rappen-charcoal">
									datenschutz@rappen.ch
								</a>
							</p>
							<p>
								Rechtliches:{" "}
								<a href="mailto:legal@rappen.ch" className="underline hover:text-rappen-charcoal">
									legal@rappen.ch
								</a>
							</p>
						</div>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">Plattform</h2>
						<div className="mt-3 space-y-2">
							<p>
								Website:{" "}
								<a href="https://rappen.ch" className="underline hover:text-rappen-charcoal">
									rappen.ch
								</a>
							</p>
							<p>
								API:{" "}
								<span className="font-mono text-sm">api.rappen.ch/v1/</span>
							</p>
						</div>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">Haftungsausschluss</h2>
						<p className="mt-3">
							Die auf dieser Plattform angebotenen Berechnungen und Informationen
							dienen als Arbeitshilfe und ersetzen keine professionelle Beratung
							durch zugelassene Fachpersonen. Der Betreiber übernimmt keine Haftung
							für die Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten
							Inhalte und Berechnungen.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">Urheberrecht</h2>
						<p className="mt-3">
							Die Inhalte dieser Website einschliesslich der Texte, Grafiken,
							Software und des Designs sind urheberrechtlich geschützt. Jede Verwertung
							ausserhalb der Grenzen des Urheberrechtsgesetzes bedarf der
							schriftlichen Zustimmung des Betreibers.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">Anwendbares Recht</h2>
						<p className="mt-3">
							Es gilt Schweizer Recht. Gerichtsstand ist Zürich, Schweiz.
						</p>
					</section>
				</div>
			</Container>
		</section>
	);
}
