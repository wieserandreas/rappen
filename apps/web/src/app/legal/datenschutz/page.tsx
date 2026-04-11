import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
	title: "Datenschutzerklärung",
};

export default function DatenschutzPage() {
	return (
		<section className="py-16">
			<Container size="narrow">
				<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
					Rechtliches
				</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-tight text-rappen-charcoal">
					Datenschutzerklärung
				</h1>
				<p className="mt-2 text-sm text-rappen-muted">Gültig ab 1. April 2026</p>

				<div className="mt-10 space-y-8 text-[15px] leading-relaxed text-rappen-charcoal/90">
					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">1. Verantwortliche Stelle</h2>
						<p className="mt-3">
							Verantwortlich für die Datenbearbeitung auf der Plattform rappen.ch ist
							Rappen, Zürich, Schweiz. Kontakt:{" "}
							<a href="mailto:datenschutz@rappen.ch" className="underline hover:text-rappen-charcoal">
								datenschutz@rappen.ch
							</a>
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">2. Rechtsgrundlage</h2>
						<p className="mt-3">
							Die Datenbearbeitung erfolgt gestützt auf das Bundesgesetz über den
							Datenschutz (DSG, SR 235.1) in der Fassung vom 1. September 2023
							(revidiertes DSG) sowie, soweit anwendbar, die Datenschutz-Grundverordnung
							(DSGVO) der Europäischen Union.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">3. Erhobene Daten</h2>
						<div className="mt-3 space-y-3">
							<p>
								<strong>3.1 Bei der Registrierung:</strong> E-Mail-Adresse,
								Firmenname, Passwort (gehasht gespeichert). Diese Daten werden bei
								Supabase (EU-Region) gespeichert.
							</p>
							<p>
								<strong>3.2 Bei der Nutzung der Tools:</strong> Berechnungs-Inputs
								(Bruttolohn, Kanton, etc.) werden{" "}
								<strong>nicht persistent gespeichert</strong>. Sie werden
								ausschliesslich für die Dauer der Berechnung verarbeitet und
								anschliessend verworfen.
							</p>
							<p>
								<strong>3.3 Bei der API-Nutzung:</strong> API-Calls werden mit
								Zeitstempel, Endpoint und Status-Code für Abrechnungszwecke
								protokolliert. Die Inhalte der Anfragen werden nicht gespeichert.
							</p>
							<p>
								<strong>3.4 Automatisch:</strong> IP-Adresse (für Rate-Limiting),
								Browser-Informationen (User-Agent), Zugriffszeiten. Es werden keine
								Tracking-Cookies verwendet.
							</p>
						</div>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">4. Zweck der Datenbearbeitung</h2>
						<ul className="mt-3 space-y-2 list-disc list-inside text-rappen-charcoal/80">
							<li>Bereitstellung und Betrieb der Plattform</li>
							<li>Benutzerverwaltung und Authentifizierung</li>
							<li>Abrechnung und Nutzungsüberwachung</li>
							<li>Missbrauchsprävention und Rate-Limiting</li>
							<li>Technische Fehlerbehebung</li>
						</ul>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">5. Auftragsbearbeiter</h2>
						<div className="mt-3 overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b border-rappen-border text-left">
										<th className="py-2 pr-4 font-semibold">Dienst</th>
										<th className="py-2 pr-4 font-semibold">Anbieter</th>
										<th className="py-2 pr-4 font-semibold">Zweck</th>
										<th className="py-2 font-semibold">Standort</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-rappen-border/50 text-rappen-charcoal/80">
									<tr>
										<td className="py-2 pr-4">Supabase</td>
										<td className="py-2 pr-4">Supabase Inc.</td>
										<td className="py-2 pr-4">Auth, Datenbank</td>
										<td className="py-2">EU (Frankfurt)</td>
									</tr>
									<tr>
										<td className="py-2 pr-4">Vercel</td>
										<td className="py-2 pr-4">Vercel Inc.</td>
										<td className="py-2 pr-4">Hosting</td>
										<td className="py-2">EU / US</td>
									</tr>
									<tr>
										<td className="py-2 pr-4">Stripe</td>
										<td className="py-2 pr-4">Stripe Inc.</td>
										<td className="py-2 pr-4">Zahlungsabwicklung</td>
										<td className="py-2">EU (Irland)</td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">6. Datensicherheit</h2>
						<p className="mt-3">
							Alle Verbindungen zur Plattform sind TLS-verschlüsselt (HTTPS).
							Passwörter werden mit bcrypt gehasht gespeichert. API-Schlüssel werden
							einseitig gehasht — wir können Ihren API-Key nach der Erstellung nicht
							mehr einsehen.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">7. Ihre Rechte</h2>
						<p className="mt-3">
							Gemäss DSG und DSGVO haben Sie das Recht auf Auskunft, Berichtigung,
							Löschung und Datenportabilität. Sie können Ihren Account jederzeit
							löschen. Für Anfragen wenden Sie sich an{" "}
							<a href="mailto:datenschutz@rappen.ch" className="underline hover:text-rappen-charcoal">
								datenschutz@rappen.ch
							</a>
							.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">8. Cookies</h2>
						<p className="mt-3">
							Die Plattform verwendet ausschliesslich technisch notwendige Cookies für
							die Authentifizierung (Supabase Auth Session). Es werden keine
							Marketing- oder Tracking-Cookies eingesetzt. Ein Cookie-Banner ist daher
							nicht erforderlich.
						</p>
					</section>

					<section>
						<h2 className="text-lg font-semibold text-rappen-charcoal">9. Änderungen</h2>
						<p className="mt-3">
							Der Anbieter behält sich vor, diese Datenschutzerklärung bei Bedarf
							anzupassen. Die jeweils aktuelle Fassung gilt ab dem Zeitpunkt der
							Veröffentlichung auf dieser Seite.
						</p>
					</section>

					<section className="border-t border-rappen-border pt-6">
						<p className="text-sm text-rappen-muted">
							Rappen · Zürich, Schweiz
							<br />
							Kontakt:{" "}
							<a href="mailto:datenschutz@rappen.ch" className="underline hover:text-rappen-charcoal">
								datenschutz@rappen.ch
							</a>
						</p>
					</section>
				</div>
			</Container>
		</section>
	);
}
