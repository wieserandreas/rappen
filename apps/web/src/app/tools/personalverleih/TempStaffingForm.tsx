"use client";

import { useState, useTransition } from "react";
import { CANTONS } from "@rappen/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { validateTempStaffingAction, type TempStaffingActionResult } from "./actions";
import { cn } from "@/lib/cn";

export function TempStaffingForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<TempStaffingActionResult | null>(null);

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const res = await validateTempStaffingAction(formData);
			setResult(res);
		});
	}

	return (
		<div className="grid gap-8 lg:grid-cols-5">
			<form action={handleSubmit} className="lg:col-span-3 space-y-6">
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Einsatz
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Select label="Einsatzkanton" name="canton" defaultValue="ZH">
							{CANTONS.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</Select>
						<Input label="Branche" name="industry" placeholder="z.B. Bau, IT, Reinigung" required />
						<Input label="Einsatzbeginn" name="start_date" type="date" required />
						<Input label="Einsatzende (optional)" name="end_date" type="date" />
						<Input label="GAV-Code (optional)" name="gav_code" placeholder="z.B. LMV-Bau" />
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Arbeitnehmer/in
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Input label="Nationalität (ISO)" name="nationality" defaultValue="CH" maxLength={3} />
						<Select label="Bewilligung" name="permit_type" defaultValue="CH">
							<option value="CH">CH (Schweizer)</option>
							<option value="C">C (Niederlassung)</option>
							<option value="B">B (Aufenthalt)</option>
							<option value="G">G (Grenzgänger)</option>
							<option value="L">L (Kurzaufenthalt)</option>
							<option value="F">F (vorl. Aufnahme)</option>
							<option value="N">N (Asylsuchend)</option>
							<option value="S">S (Schutzstatus)</option>
						</Select>
						<Input
							label="Stundenlohn"
							name="hourly_rate"
							type="number"
							step="0.05"
							min="0"
							placeholder="55"
							suffix="CHF"
							required
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
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Verleih-Agentur
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Select label="Bewilligungstyp" name="license_type" defaultValue="ch_only">
							<option value="ch_only">Nur Schweiz</option>
							<option value="ch_and_abroad">Schweiz + Ausland</option>
						</Select>
						<Input
							label="Hinterlegte Kaution"
							name="caution_amount"
							type="number"
							step="1000"
							min="0"
							placeholder="50000"
							suffix="CHF"
						/>
					</div>
					<div className="mt-4 flex flex-col gap-3 border-t border-rappen-border pt-4">
						<label className="flex items-center gap-3 text-sm text-rappen-charcoal cursor-pointer">
							<input
								type="checkbox"
								name="has_seco_license"
								defaultChecked
								className="h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
							/>
							SECO-Bewilligung vorhanden (AVG Art. 12)
						</label>
						<label className="flex items-center gap-3 text-sm text-rappen-charcoal cursor-pointer">
							<input
								type="checkbox"
								name="has_caution"
								defaultChecked
								className="h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
							/>
							Kaution hinterlegt (AVV Art. 35)
						</label>
					</div>
				</fieldset>

				<Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
					Compliance prüfen
				</Button>
			</form>

			<aside className="lg:col-span-2">
				<div className="sticky top-24 space-y-4">
					{!result && (
						<div className="rounded-xl border border-dashed border-rappen-border bg-white p-8 text-center">
							<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
								Ergebnis
							</h3>
							<p className="mt-4 text-sm text-rappen-muted">
								Geben Sie die Einsatzdaten ein und prüfen Sie die Compliance.
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
							<div
								className={cn(
									"rounded-xl border-2 p-6",
									result.data.compliant
										? "border-emerald-500 bg-emerald-50"
										: "border-rappen-red bg-rappen-red/5",
								)}
							>
								<p
									className={cn(
										"text-base font-semibold",
										result.data.compliant ? "text-emerald-700" : "text-rappen-red",
									)}
								>
									{result.data.compliant ? "AVG-konform" : "Nicht konform"}
								</p>
								<p className="mt-1 text-xs text-rappen-muted">
									{result.data.violations.length} Befund{result.data.violations.length !== 1 ? "e" : ""}
								</p>
							</div>

							<div className="rounded-xl border border-rappen-border bg-white p-6">
								<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
									Anforderungen
								</h3>
								<dl className="mt-4 space-y-3 text-sm">
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Erforderliche Kaution</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.required_caution}
										</dd>
									</div>
									{result.data.max_assignment_duration && (
										<div className="flex justify-between">
											<dt className="text-rappen-muted">Max. Einsatzdauer</dt>
											<dd className="font-semibold text-rappen-charcoal">
												{result.data.max_assignment_duration}
											</dd>
										</div>
									)}
								</dl>
							</div>

							{result.data.violations.length > 0 && (
								<div className="rounded-xl border border-rappen-border bg-white p-6">
									<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
										Befunde
									</h3>
									<ul className="mt-4 space-y-3">
										{result.data.violations.map((v, i) => (
											<li
												key={i}
												className={cn(
													"rounded-lg border p-3 text-xs",
													v.severity === "error"
														? "border-rappen-red/30 bg-rappen-red/5"
														: "border-amber-200 bg-amber-50",
												)}
											>
												<div className="flex items-start justify-between gap-2">
													<p
														className={cn(
															"font-semibold",
															v.severity === "error" ? "text-rappen-red" : "text-amber-800",
														)}
													>
														{v.rule}
													</p>
													<span className="font-mono text-[10px] uppercase tracking-wider text-rappen-muted">
														{v.article}
													</span>
												</div>
												<p className="mt-1 text-rappen-charcoal/80">{v.message}</p>
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
