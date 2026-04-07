"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { analyzePayEquityAction, type PayEquityActionResult } from "./actions";
import { cn } from "@/lib/cn";

const SAMPLE_CSV = `geschlecht;lohn;ausbildung;erfahrung;dienstjahre;kompetenz;position;pensum
M;9500;3;10;5;2;3;100
M;10500;4;15;8;3;4;100
M;11000;5;20;12;4;5;100
M;9200;3;8;4;2;2;100
M;9800;4;12;6;3;3;100
M;10800;5;18;10;4;4;100
F;9300;3;10;5;2;3;100
F;10200;4;15;8;3;4;100
F;10800;5;20;12;4;5;100
F;9000;3;8;4;2;2;100
F;9700;4;12;6;3;3;100
F;10600;5;18;10;4;4;100`;

export function PayEquityForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<PayEquityActionResult | null>(null);
	const [csv, setCsv] = useState("");

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const res = await analyzePayEquityAction(formData);
			setResult(res);
		});
	}

	return (
		<div className="grid gap-8 lg:grid-cols-5">
			<form action={handleSubmit} className="lg:col-span-3 space-y-6">
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Unternehmen
					</legend>
					<div className="mt-4">
						<Input
							label="Firmenname"
							name="company_name"
							placeholder="Beispiel AG"
							required
						/>
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Mitarbeiterdaten (CSV)
					</legend>
					<div className="mt-4 space-y-3">
						<p className="text-xs text-rappen-muted">
							Format pro Zeile (Semikolon-getrennt):{" "}
							<code className="font-mono text-[11px] text-rappen-charcoal">
								geschlecht;lohn;ausbildung;erfahrung;dienstjahre;kompetenz;position;pensum
							</code>
							<br />
							Geschlecht: <strong>M</strong> oder <strong>F</strong> · Ausbildung: 1–5 ·
							Kompetenz: 1–4 · Position: 1–5 · Pensum: 10–100
						</p>
						<button
							type="button"
							onClick={() => setCsv(SAMPLE_CSV)}
							className="text-xs font-medium text-rappen-charcoal underline hover:text-rappen-gold"
						>
							Beispieldaten einfügen (12 Mitarbeitende)
						</button>
						<textarea
							name="csv_data"
							value={csv}
							onChange={(e) => setCsv(e.target.value)}
							rows={14}
							placeholder="geschlecht;lohn;ausbildung;erfahrung;dienstjahre;kompetenz;position;pensum&#10;M;9500;3;10;5;2;3;100&#10;..."
							className="w-full rounded-md border border-rappen-border bg-white p-3 font-mono text-xs leading-relaxed text-rappen-charcoal placeholder:text-rappen-muted-dark focus:outline-none focus:ring-2 focus:ring-rappen-charcoal/10 focus:border-rappen-charcoal"
							required
						/>
						<p className="text-xs text-rappen-muted">
							Mindestens 10 Mitarbeitende, je 2 pro Geschlecht erforderlich.
						</p>
					</div>
				</fieldset>

				<Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
					Analyse starten
				</Button>

				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
					<strong>Logib-Methodik:</strong> Diese Analyse verwendet die Blinder-Oaxaca-Regression
					gemäss dem Standard-Analyse-Modell des Eidgenössischen Büros für die Gleichstellung
					von Frau und Mann (EBG). Die Resultate sind nicht rechtsverbindlich, dienen aber
					als Grundlage für die GlG-Selbstanalyse.
				</div>
			</form>

			<aside className="lg:col-span-2">
				<div className="sticky top-24 space-y-4">
					{!result && (
						<div className="rounded-xl border border-dashed border-rappen-border bg-white p-8 text-center">
							<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
								Analyse
							</h3>
							<p className="mt-4 text-sm text-rappen-muted">
								Fügen Sie die Mitarbeiterdaten ein und starten Sie die Analyse.
							</p>
						</div>
					)}

					{result && !result.success && (
						<div className="rounded-xl border border-rappen-red/30 bg-rappen-red/5 p-6">
							<p className="text-sm font-semibold text-rappen-red whitespace-pre-line">
								{result.error}
							</p>
						</div>
					)}

					{result?.success && result.data && (
						<>
							<div
								className={cn(
									"rounded-xl border-2 p-6",
									result.data.compliant
										? "border-emerald-500 bg-emerald-50"
										: "border-rappen-red bg-rappen-red/5",
								)}
							>
								<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
									Lohngleichheit
								</p>
								<p
									className={cn(
										"mt-2 text-3xl font-semibold tracking-tight",
										result.data.compliant ? "text-emerald-700" : "text-rappen-red",
									)}
								>
									{result.data.compliant ? "Konform" : "Nicht konform"}
								</p>
								<p className="mt-2 text-sm text-rappen-charcoal">
									Unerklärter Lohnunterschied:{" "}
									<span className="font-semibold tabular-nums">
										{result.data.unexplained_gap_percent}
									</span>
								</p>
								<p className="text-xs text-rappen-muted">
									Toleranzschwelle: {result.data.tolerance_threshold}
								</p>
							</div>

							<div className="rounded-xl border border-rappen-border bg-white p-6">
								<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
									Statistik
								</h3>
								<dl className="mt-4 space-y-3 text-sm">
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Stichprobe</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.sample_size} MA
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-rappen-muted">R²</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.regression_details.r_squared}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-rappen-muted">t-Statistik</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.t_statistic}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-rappen-muted">p-Wert</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.p_value}
										</dd>
									</div>
								</dl>
							</div>

							<div className="rounded-xl border border-rappen-border bg-white p-6">
								<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
									Empfehlung
								</h3>
								<p className="mt-3 text-sm leading-relaxed text-rappen-charcoal">
									{result.data.recommendation}
								</p>
							</div>
						</>
					)}
				</div>
			</aside>
		</div>
	);
}
