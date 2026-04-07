"use client";

import { useState, useTransition } from "react";
import { CANTONS } from "@rappen/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { generateContractAction, type ContractActionResult } from "./actions";

const CONTRACT_TYPES: Array<{ value: string; label: string; description: string }> = [
	{ value: "employment-permanent", label: "Unbefristeter Arbeitsvertrag", description: "OR Art. 319ff" },
	{ value: "employment-fixed-term", label: "Befristeter Arbeitsvertrag", description: "OR Art. 334" },
	{ value: "freelancer", label: "Freelancer-/Werkvertrag", description: "OR Art. 363ff" },
	{ value: "nda", label: "Geheimhaltungsvereinbarung (NDA)", description: "OR Art. 321a, 160" },
	{ value: "termination-agreement", label: "Aufhebungsvereinbarung", description: "OR Art. 341" },
	{ value: "internship", label: "Praktikumsvertrag", description: "OR Art. 344ff" },
	{ value: "ceo-contract", label: "Geschäftsführer-Vertrag", description: "OR Art. 716b, 340" },
	{ value: "shareholder-agreement", label: "Gesellschaftervertrag", description: "OR Art. 772–827" },
	{ value: "service-agreement-b2b", label: "B2B-Dienstleistungsvertrag", description: "OR Art. 394ff" },
	{ value: "commercial-lease", label: "Geschäftsmietvertrag", description: "OR Art. 253ff" },
];

export function ContractForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<ContractActionResult | null>(null);
	const [contractType, setContractType] = useState("employment-permanent");

	const isEmploymentType = contractType.startsWith("employment-");
	const isFixedTerm = contractType === "employment-fixed-term";

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const res = await generateContractAction(formData);
			setResult(res);
		});
	}

	return (
		<div className="grid gap-8 lg:grid-cols-5">
			<form action={handleSubmit} className="lg:col-span-3 space-y-6">
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Vertragstyp
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Select
							label="Typ"
							name="type"
							value={contractType}
							onChange={(e) => setContractType(e.target.value)}
						>
							{CONTRACT_TYPES.map((t) => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</Select>
						<Select label="Sprache" name="language" defaultValue="de">
							<option value="de">Deutsch</option>
							<option value="fr">Französisch</option>
							<option value="it">Italienisch</option>
							<option value="en">Englisch</option>
						</Select>
						<Select label="Kanton (Gerichtsstand)" name="canton" defaultValue="ZH">
							{CANTONS.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</Select>
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Vertragspartei 1 {isEmploymentType ? "(Arbeitgeber)" : ""}
					</legend>
					<div className="mt-4 grid gap-4">
						<Input label="Name / Firma" name="party1_name" placeholder="Rappen AG" required />
						<Input label="Strasse" name="party1_address" placeholder="Bahnhofstrasse 10" />
						<div className="grid grid-cols-3 gap-3">
							<Input label="PLZ" name="party1_postal" placeholder="8001" />
							<div className="col-span-2">
								<Input label="Ort" name="party1_city" placeholder="Zürich" required />
							</div>
						</div>
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Vertragspartei 2 {isEmploymentType ? "(Arbeitnehmer/in)" : ""}
					</legend>
					<div className="mt-4 grid gap-4">
						<Input label="Name" name="party2_name" placeholder="Max Muster" required />
						<Input label="Strasse" name="party2_address" placeholder="Seestrasse 5" />
						<div className="grid grid-cols-3 gap-3">
							<Input label="PLZ" name="party2_postal" placeholder="8002" />
							<div className="col-span-2">
								<Input label="Ort" name="party2_city" placeholder="Zürich" required />
							</div>
						</div>
					</div>
				</fieldset>

				{isEmploymentType && (
					<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
						<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
							Vertragsdaten
						</legend>
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							<Input label="Stellenbezeichnung" name="job_title" placeholder="Software-Entwickler/in" />
							<Input label="Arbeitsort" name="workplace" placeholder="Zürich" />
							<Input label="Stellenantritt" name="start_date" type="date" required />
							{isFixedTerm && (
								<Input label="Befristung bis" name="end_date" type="date" required />
							)}
							<Input
								label="Bruttolohn pro Monat"
								name="gross_monthly"
								type="number"
								step="0.05"
								min="0"
								placeholder="8500"
								suffix="CHF"
							/>
							<Input
								label="Beschäftigungsgrad"
								name="employment_percentage"
								type="number"
								min={10}
								max={100}
								defaultValue={100}
								suffix="%"
							/>
							<Input
								label="Kündigungsfrist (Monate)"
								name="notice_period"
								type="number"
								min={1}
								max={6}
								defaultValue={1}
							/>
							<Input
								label="Ferienanspruch (Tage / Jahr)"
								name="vacation_days"
								type="number"
								min={20}
								max={30}
								defaultValue={20}
							/>
						</div>
					</fieldset>
				)}

				<Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
					Vertragsentwurf vorbereiten
				</Button>
			</form>

			<aside className="lg:col-span-2">
				<div className="sticky top-24 space-y-4">
					{!result && (
						<div className="rounded-xl border border-dashed border-rappen-border bg-white p-8 text-center">
							<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
								Vertragsentwurf
							</h3>
							<p className="mt-4 text-sm text-rappen-muted">
								Wählen Sie einen Vertragstyp und füllen Sie die Daten aus.
							</p>
						</div>
					)}

					{result && !result.success && (
						<div className="rounded-xl border border-rappen-red/30 bg-rappen-red/5 p-6">
							<p className="text-sm font-semibold text-rappen-red">{result.error}</p>
						</div>
					)}

					{result?.success && result.data && (
						<>
							<div className="rounded-xl border-2 border-rappen-charcoal bg-rappen-charcoal p-6 text-rappen-white">
								<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
									Bereit zur Generierung
								</p>
								<p className="mt-2 text-2xl font-semibold tracking-tight">
									{result.data.title}
								</p>
								<p className="mt-2 text-xs text-rappen-muted-dark">
									{result.data.parties_count} Vertragsparteien · Template{" "}
									<span className="font-mono">{result.data.template_name}</span>
								</p>
							</div>

							<div className="rounded-xl border border-rappen-border bg-white p-6">
								<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
									Pflichtklauseln
								</h3>
								<ul className="mt-4 space-y-2 text-sm text-rappen-charcoal">
									{result.data.required_clauses.map((clause) => (
										<li key={clause} className="flex items-start gap-2">
											<svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-rappen-gold" viewBox="0 0 16 16" fill="none">
												<path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
											{clause}
										</li>
									))}
								</ul>
							</div>

							<div className="rounded-xl border border-rappen-border bg-white p-6">
								<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
									Rechtsgrundlage
								</h3>
								<ul className="mt-4 space-y-1 text-xs text-rappen-charcoal">
									{result.data.legal_basis.map((b) => (
										<li key={b} className="font-mono">{b}</li>
									))}
								</ul>
							</div>

							<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
								<strong>Hinweis:</strong> {result.data.disclaimer}
							</div>

							<p className="text-center text-xs text-rappen-muted">
								Der DOCX/PDF-Download wird mit der nächsten Version verfügbar sein.
							</p>
						</>
					)}
				</div>
			</aside>
		</div>
	);
}
