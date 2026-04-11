import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
	title: "Allgemeine Geschäftsbedingungen",
};

export default function AgbPage() {
	return (
		<section className="py-16">
			<Container size="narrow">
				<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
					Rechtliches
				</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-tight text-rappen-charcoal">
					Allgemeine Geschäftsbedingungen
				</h1>
				<p className="mt-2 text-sm text-rappen-muted">Gültig ab 1. April 2026</p>

				<div className="mt-10 space-y-8 text-[15px] leading-relaxed text-rappen-charcoal/90">
					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">1. Geltungsbereich</h2>
						<p className="mt-3">
							Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der
							API-Plattform «Rappen» (nachfolgend «Plattform»), die unter der Domain
							rappen.ch betrieben wird. Mit der Registrierung eines Accounts oder der
							Nutzung der öffentlich zugänglichen Tools akzeptiert der Nutzer diese AGB.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">2. Leistungsbeschreibung</h2>
						<p className="mt-3">
							Die Plattform bietet 10 spezialisierte API-Schnittstellen für Schweizer
							Unternehmen in den Bereichen Lohnberechnung, Quellensteuer, QR-Rechnung,
							MWST, Arbeitszeit, Lohngleichheit, Verträge, Grenzgänger,
							Firmen-Risikoanalyse und Personalverleih.
						</p>
						<p className="mt-3">
							Die Berechnungen basieren auf aktuellen Schweizer Rechtsgrundlagen und
							offiziellen Datenquellen (BSV, ESTV, SECO, kantonale Steuerverwaltungen).
							Trotz sorgfältiger Aufbereitung übernimmt der Anbieter keine Gewähr für
							die Richtigkeit, Vollständigkeit oder Aktualität der Ergebnisse.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">3. Nutzungsstufen</h2>
						<ul className="mt-3 space-y-2 list-disc list-inside text-rappen-charcoal/80">
							<li>
								<strong>Stufe 0 (ohne Account):</strong> Zugang zur QR-Rechnung mit
								einer Begrenzung von 3 Nutzungen pro Tag und IP-Adresse.
							</li>
							<li>
								<strong>Stufe 1 (Gratis-Account):</strong> Zugang zu Lohnrechner,
								Quellensteuer und QR-Rechnung mit 10 Berechnungen pro Tag.
							</li>
							<li>
								<strong>Stufe 2+ (Bezahlte Pläne):</strong> Zugang zu allen 10 APIs
								gemäss dem gewählten Abonnement.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">4. Preise und Zahlung</h2>
						<p className="mt-3">
							Die aktuellen Preise sind auf der Preisseite unter rappen.ch/pricing
							einsehbar. Alle Preise verstehen sich in Schweizer Franken (CHF) und
							exklusive MWST. Abonnements werden monatlich in Rechnung gestellt und
							sind monatlich kündbar.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">5. Haftungsbeschränkung</h2>
						<p className="mt-3">
							Die Resultate der Plattform dienen als Berechnungsgrundlage und ersetzen
							keine Beratung durch zugelassene Fachpersonen (Treuhänder, Steuerberater,
							Anwälte). Die Nutzung erfolgt auf eigene Verantwortung des Nutzers.
						</p>
						<p className="mt-3">
							Der Anbieter haftet nicht für direkte oder indirekte Schäden, die aus der
							Nutzung oder Nichtnutzung der Plattform entstehen, soweit gesetzlich
							zulässig. Die Haftung für Vorsatz und grobe Fahrlässigkeit bleibt
							vorbehalten.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">6. Datenschutz</h2>
						<p className="mt-3">
							Der Anbieter verarbeitet personenbezogene Daten gemäss der separaten
							Datenschutzerklärung unter rappen.ch/legal/datenschutz und den
							Bestimmungen des Bundesgesetzes über den Datenschutz (DSG).
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">7. Geistiges Eigentum</h2>
						<p className="mt-3">
							Sämtliche Rechte an der Plattform, einschliesslich der Software, der
							Algorithmen und des Designs, verbleiben beim Anbieter. Dem Nutzer wird
							ein nicht-exklusives, nicht-übertragbares Nutzungsrecht im Rahmen des
							gewählten Abonnements eingeräumt.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">8. Kündigung</h2>
						<p className="mt-3">
							Bezahlte Abonnements können jederzeit per Ende des laufenden
							Abrechnungsmonats gekündigt werden. Gratis-Accounts können jederzeit
							gelöscht werden. Der Anbieter behält sich das Recht vor, Accounts bei
							Verstoss gegen diese AGB zu sperren oder zu löschen.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">9. Änderungen der AGB</h2>
						<p className="mt-3">
							Der Anbieter behält sich das Recht vor, diese AGB jederzeit zu ändern.
							Änderungen werden den Nutzern per E-Mail oder über die Plattform
							mitgeteilt. Die Weiternutzung der Plattform nach Inkrafttreten der
							Änderungen gilt als Zustimmung.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">10. Anwendbares Recht und Gerichtsstand</h2>
						<p className="mt-3">
							Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist Zürich,
							Schweiz. Für Konsumenten gelten die zwingenden Gerichtsstandsbestimmungen
							des Bundesgesetzes über den Gerichtsstand in Zivilsachen (ZPO).
						</p>
					</section>

					<section className="border-t border-rappen-border pt-6">
						<p className="text-sm text-rappen-muted">
							Rappen · Zürich, Schweiz
							<br />
							Kontakt:{" "}
							<a href="mailto:legal@rappen.ch" className="underline hover:text-rappen-charcoal">
								legal@rappen.ch
							</a>
						</p>
					</section>
				</div>
			</Container>
		</section>
	);
}
