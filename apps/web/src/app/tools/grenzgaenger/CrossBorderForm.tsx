"use client";

import { useState, useTransition } from "react";
import { CANTONS } from "@rappen/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { calculateCrossBorderAction, type CrossBorderActionResult } from "./actions";
import { cn } from "@/lib/cn";

const COUNTRIES = [
	{ code: "DE", label: "Deutschland" },
	{ code: "FR", label: "Frankreich" },
	{ code: "IT", label: "Italien" },
	{ code: "AT", label: "Österreich" },
	{ code: "LI", label: "Liechtenstein" },
];

export function CrossBorderForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<CrossBorderActionResult | null>(null);

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const res = await calculateCrossBorderAction(formData);
			setResult(res);
		});
	}

	return (
		<div className="grid gap-8 lg:grid-cols-5">
			<form action={handleSubmit} className="lg:col-span-3 space-y-6">
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Grenzgänger-Situation
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Select label="Wohnsitzstaat" name="residence_country" defaultValue="DE">
							{COUNTRIES.map((c) => (
								<option key={c.code} value={c.code}>
									{c.label}
								</option>
							))}
						</Select>
						<Select label="Arbeitskanton (CH)" name="work_canton" defaultValue="ZH">
							{CANTONS.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</Select>
						<Input
							label="Jahres-Bruttolohn"
							name="gross_annual"
							type="number"
							step="100"
							min="0"
							defaultValue={100000}
							suffix="CHF"
							required
						/>
						<Input
							label="Nationalität"
							name="nationality"
							placeholder="DE"
							maxLength={3}
							defaultValue="DE"
						/>
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Arbeitstage & Telework
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Input
							label="Arbeitstage / Jahr"
							name="total_work_days"
							type="number"
							min="1"
							max="366"
							defaultValue={220}
							required
						/>
						<Input
							label="Davon Telework-Tage"
							name="telework_days"
							type="number"
							min="0"
							defaultValue={0}
							hint="Home Office im Wohnsitzstaat"
						/>
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Persönliche Situation
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Select label="Zivilstand" name="marital_status" defaultValue="single">
							<option value="single">Ledig</option>
							<option value="married">Verheiratet</option>
						</Select>
						<Input
							label="Anzahl Kinder"
							name="children"
							type="number"
							min="0"
							max="10"
							defaultValue={0}
						/>
					</div>
					<div className="mt-4 border-t border-rappen-border pt-4">
						<label className="flex items-center gap-3 text-sm text-rappen-charcoal cursor-pointer">
							<input
								type="checkbox"
								name="has_g_permit"
								defaultChecked
								className="h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
							/>
							G-Bewilligung (Grenzgänger) vorhanden
						</label>
					</div>
				</fieldset>

				<Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
					Analyse starten
				</Button>
			</form>

			<aside className="lg:col-span-2">
				<div className="sticky top-24 space-y-4">
					{!result && (
						<div className="rounded-xl border border-dashed border-rappen-border bg-white p-8 text-center">
							<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
								Analyse
							</h3>
							<p className="mt-4 text-sm text-rappen-muted">
								Geben Sie die Grenzgänger-Daten ein und starten Sie die Analyse.
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
									Steuerliche Zuständigkeit
								</p>
								<p className="mt-2 text-2xl font-semibold tracking-tight">
									{result.data.tax_jurisdiction}
								</p>
								<div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
									<div>
										<p className="uppercase tracking-wider text-rappen-muted-dark">Sozialversicherung</p>
										<p className="mt-1 font-medium">{result.data.social_security_country}</p>
									</div>
									<div>
										<p className="uppercase tracking-wider text-rappen-muted-dark">Telework</p>
										<p className="mt-1 font-medium tabular-nums">{result.data.telework_percentage}</p>
									</div>
								</div>
							</div>

							<div className="rounded-xl border border-rappen-border bg-white p-6">
								<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
									Erfordernisse
								</h3>
								<ul className="mt-4 space-y-3 text-sm">
									<RequirementRow label="Quellensteuer in CH" value={result.data.withholding_tax_applicable} />
									<RequirementRow label="A1-Bescheinigung" value={result.data.a1_certificate_required} />
									<RequirementRow label="LEADS-Reporting" value={result.data.leads_reporting_required} />
									<RequirementRow
										label="Telework-Schwelle überschritten"
										value={result.data.telework_threshold_exceeded}
										invertColor
									/>
								</ul>
								<div className="mt-4 border-t border-rappen-border pt-4">
									<p className="text-xs text-rappen-muted">
										Rechtsgrundlage: {result.data.dba_article}
									</p>
								</div>
							</div>

							{result.data.warnings.length > 0 && (
								<div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
									<h3 className="text-sm font-semibold uppercase tracking-wider text-amber-800">
										Hinweise
									</h3>
									<ul className="mt-3 space-y-2 text-xs text-amber-900">
										{result.data.warnings.map((w, i) => (
											<li key={i} className="flex gap-2">
												<span>•</span>
												<span>{w}</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</>
					)}
				</div>
			</aside>
		</div>
	);
}

function RequirementRow({
	label,
	value,
	invertColor,
}: {
	label: string;
	value: boolean;
	invertColor?: boolean;
}) {
	const isPositive = invertColor ? !value : value;
	return (
		<li className="flex items-center justify-between">
			<span className="text-rappen-charcoal">{label}</span>
			<span
				className={cn(
					"inline-flex items-center gap-1.5 text-xs font-semibold",
					value
						? invertColor
							? "text-rappen-red"
							: "text-emerald-700"
						: "text-rappen-muted",
				)}
			>
				{value ? "Ja" : "Nein"}
			</span>
		</li>
	);
}
