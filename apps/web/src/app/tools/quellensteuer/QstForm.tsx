"use client";

import { useState, useTransition } from "react";
import { CANTONS } from "@rappen/shared";
import { SUPPORTED_QST_CANTONS } from "@rappen/swiss-data";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { calculateQstAction, type QstActionResult } from "./actions";
import { formatChf } from "@/lib/format";

const CANTON_NAMES: Record<string, string> = {
	AG: "Aargau", AI: "Appenzell I.", AR: "Appenzell A.", BE: "Bern",
	BL: "Basel-Landschaft", BS: "Basel-Stadt", FR: "Freiburg", GE: "Genf",
	GL: "Glarus", GR: "Graubünden", JU: "Jura", LU: "Luzern", NE: "Neuenburg",
	NW: "Nidwalden", OW: "Obwalden", SG: "St. Gallen", SH: "Schaffhausen",
	SO: "Solothurn", SZ: "Schwyz", TG: "Thurgau", TI: "Tessin", UR: "Uri",
	VD: "Waadt", VS: "Wallis", ZG: "Zug", ZH: "Zürich",
};

const SUPPORTED_SET = new Set<string>(SUPPORTED_QST_CANTONS);

const TARIFF_DESCRIPTIONS: Record<string, string> = {
	A: "A — Alleinstehend ohne Kinder",
	B: "B — Verheiratet, Alleinverdiener",
	C: "C — Verheiratet, Doppelverdiener",
	D: "D — Nebenerwerbseinkommen",
	E: "E — Abrechnungsverfahren",
	F: "F — Grenzgänger Italien",
	G: "G — Ersatzeinkünfte (Renten)",
	H: "H — Alleinstehend mit Kindern",
};

export function QstForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<QstActionResult | null>(null);

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const res = await calculateQstAction(formData);
			setResult(res);
		});
	}

	const fieldError = (field: string) => result?.fieldErrors?.[field];

	return (
		<div className="grid gap-8 lg:grid-cols-5">
			<form action={handleSubmit} className="lg:col-span-3 space-y-6">
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Grunddaten
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Select label="Kanton" name="canton" defaultValue="ZH" required>
							<optgroup label="Tarife verfügbar">
								{CANTONS.filter((c) => SUPPORTED_SET.has(c)).map((c) => (
									<option key={c} value={c}>
										{c} – {CANTON_NAMES[c]}
									</option>
								))}
							</optgroup>
							<optgroup label="Tarife in Vorbereitung">
								{CANTONS.filter((c) => !SUPPORTED_SET.has(c)).map((c) => (
									<option key={c} value={c} disabled>
										{c} – {CANTON_NAMES[c]}
									</option>
								))}
							</optgroup>
						</Select>
						<Input
							label="Steuerjahr"
							name="year"
							type="number"
							min={2024}
							max={2030}
							defaultValue={2026}
							required
							error={fieldError("year")}
						/>
						<Input
							label="Bruttolohn pro Monat"
							name="gross_monthly"
							type="number"
							step="0.05"
							min="0"
							placeholder="8500"
							suffix="CHF"
							required
							error={fieldError("gross_monthly")}
						/>
						<Input
							label="Anzahl Kinder"
							name="children"
							type="number"
							min="0"
							max="9"
							defaultValue={0}
							error={fieldError("children")}
						/>
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Tarif
					</legend>
					<div className="mt-4 grid gap-4">
						<Select label="Tarifcode" name="tariff_code" defaultValue="A">
							{Object.entries(TARIFF_DESCRIPTIONS).map(([code, label]) => (
								<option key={code} value={code}>
									{label}
								</option>
							))}
						</Select>
						<Select label="Konfession" name="church" defaultValue="keine">
							<option value="keine">Keine</option>
							<option value="reformiert">Reformiert</option>
							<option value="katholisch">Katholisch</option>
							<option value="christkatholisch">Christ-katholisch</option>
						</Select>
						<label className="flex items-center gap-3 text-sm text-rappen-charcoal cursor-pointer">
							<input
								type="checkbox"
								name="thirteenth_salary"
								className="h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
							/>
							13. Monatslohn ausbezahlt
						</label>
					</div>
				</fieldset>

				<Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
					Quellensteuer berechnen
				</Button>

				<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
					<strong>Tariflage 2026:</strong> Verfügbar sind aktuell die offiziellen
					Tarife des Kantons <strong>Zürich</strong>. Weitere Kantone werden laufend
					ergänzt, sobald die kantonalen Steuerverwaltungen die 2026-Tariftabellen
					publizieren. Wir verwenden ausschliesslich verifizierte Originaldaten —
					keine Schätzungen.
				</div>
			</form>

			<aside className="lg:col-span-2">
				<div className="sticky top-24 space-y-4">
					{!result && (
						<div className="rounded-xl border border-dashed border-rappen-border bg-white p-8 text-center">
							<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
								Ergebnis
							</h3>
							<p className="mt-4 text-sm text-rappen-muted">
								Geben Sie die Daten ein und klicken Sie auf
								<br />
								<span className="font-medium text-rappen-charcoal">
									„Quellensteuer berechnen"
								</span>
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
									Quellensteuer
								</p>
								<p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
									CHF {formatChf(result.data.tax_amount)}
								</p>
								<p className="mt-3 text-sm text-rappen-muted-dark">
									Effektiver Satz: {result.data.effective_rate}
								</p>
							</div>

							<div className="rounded-xl border border-rappen-border bg-white p-6">
								<dl className="space-y-3 text-sm">
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Tarifcode</dt>
										<dd className="font-mono font-semibold text-rappen-charcoal">
											{result.data.tariff_code_full}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Kanton</dt>
										<dd className="font-medium text-rappen-charcoal">{result.data.canton}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Steuerjahr</dt>
										<dd className="font-medium text-rappen-charcoal">{result.data.year}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Modell</dt>
										<dd className="font-medium text-rappen-charcoal">
											{result.data.model === "monthly" ? "Monatsmodell" : "Jahresmodell"}
										</dd>
									</div>
								</dl>
								<div className="mt-4 border-t border-rappen-border pt-4">
									<p className="text-xs text-rappen-muted">
										Rechtsgrundlage: {result.data.legal_basis}
									</p>
								</div>
							</div>
						</>
					)}
				</div>
			</aside>
		</div>
	);
}
