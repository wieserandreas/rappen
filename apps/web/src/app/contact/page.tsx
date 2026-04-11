"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/layout/Container";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export default function ContactPage() {
	const [submitted, setSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);
		// Simulate submission
		setTimeout(() => {
			setIsLoading(false);
			setSubmitted(true);
		}, 800);
	}

	return (
		<>
			{/* Header */}
			<section className="border-b border-rappen-border py-16 lg:py-20">
				<Container size="default">
					<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
						Kontakt
					</p>
					<h1 className="mt-4 text-4xl font-semibold tracking-tight text-rappen-charcoal lg:text-5xl">
						Kontakt
					</h1>
					<p className="mt-4 max-w-xl text-lg text-rappen-muted">
						Wir helfen Ihnen gerne weiter.
					</p>
				</Container>
			</section>

			{/* Content */}
			<section className="py-16 lg:py-24">
				<Container size="default">
					<div className="grid gap-12 lg:grid-cols-3">
						{/* Form - left 2/3 */}
						<div className="lg:col-span-2">
							{submitted ? (
								<Card>
									<CardBody className="py-16 text-center">
										<div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-rappen-gold/10">
											<svg
												width="28"
												height="28"
												viewBox="0 0 24 24"
												fill="none"
												stroke="#c5a55a"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												aria-hidden="true"
											>
												<path d="M20 6L9 17l-5-5" />
											</svg>
										</div>
										<h2 className="text-2xl font-semibold text-rappen-charcoal">
											Nachricht gesendet
										</h2>
										<p className="mt-3 text-rappen-muted">
											Vielen Dank für Ihre Nachricht. Wir melden uns innerhalb von
											24 Stunden bei Ihnen.
										</p>
										<Button
											variant="outline"
											className="mt-8"
											onClick={() => setSubmitted(false)}
										>
											Weitere Nachricht senden
										</Button>
									</CardBody>
								</Card>
							) : (
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid gap-6 sm:grid-cols-2">
										<Input
											label="Name"
											name="name"
											placeholder="Ihr vollständiger Name"
											required
										/>
										<Input
											label="E-Mail"
											name="email"
											type="email"
											placeholder="name@firma.ch"
											required
										/>
									</div>

									<Input
										label="Firma"
										name="company"
										placeholder="Firmenname (optional)"
									/>

									<Select label="Betreff" name="subject" required>
										<option value="">Bitte wählen...</option>
										<option value="allgemein">Allgemein</option>
										<option value="support">Technischer Support</option>
										<option value="enterprise">Enterprise-Anfrage</option>
										<option value="partnerschaft">Partnerschaft</option>
									</Select>

									<div className="flex flex-col gap-1.5">
										<label
											htmlFor="message"
											className="text-sm font-medium text-rappen-charcoal"
										>
											Nachricht
										</label>
										<textarea
											id="message"
											name="message"
											rows={5}
											required
											placeholder="Wie können wir Ihnen helfen?"
											className="w-full rounded-md border border-rappen-border bg-white px-3.5 py-3 text-[15px] text-rappen-charcoal placeholder:text-rappen-muted-dark hover:border-rappen-charcoal/40 focus:outline-none focus:ring-2 focus:ring-rappen-charcoal/10 focus:border-rappen-charcoal"
										/>
									</div>

									<Button
										type="submit"
										variant="primary"
										size="lg"
										isLoading={isLoading}
									>
										Nachricht senden
									</Button>
								</form>
							)}
						</div>

						{/* Contact info - right 1/3 */}
						<div className="space-y-6">
							<Card>
								<CardBody className="space-y-6">
									<div>
										<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-muted">
											E-Mail
										</h3>
										<a
											href="mailto:hello@rappen.ch"
											className="mt-1.5 block text-[15px] font-medium text-rappen-charcoal hover:text-rappen-gold"
										>
											hello@rappen.ch
										</a>
									</div>

									<div className="border-t border-rappen-border pt-6">
										<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-muted">
											Technischer Support
										</h3>
										<a
											href="mailto:support@rappen.ch"
											className="mt-1.5 block text-[15px] font-medium text-rappen-charcoal hover:text-rappen-gold"
										>
											support@rappen.ch
										</a>
									</div>

									<div className="border-t border-rappen-border pt-6">
										<p className="text-sm text-rappen-muted leading-relaxed">
											Wir antworten in der Regel innerhalb von 24 Stunden.
										</p>
									</div>
								</CardBody>
							</Card>

							<Card>
								<CardBody>
									<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-muted">
										Enterprise
									</h3>
									<p className="mt-2 text-sm text-rappen-muted leading-relaxed">
										Für individuelle Volumenlösungen, SLAs und dedizierte
										Infrastruktur kontaktieren Sie uns direkt.
									</p>
									<a
										href="mailto:hello@rappen.ch?subject=Enterprise-Anfrage"
										className="mt-4 inline-flex text-sm font-medium text-rappen-charcoal hover:text-rappen-gold"
									>
										Enterprise-Anfrage stellen &rarr;
									</a>
								</CardBody>
							</Card>
						</div>
					</div>
				</Container>
			</section>
		</>
	);
}
