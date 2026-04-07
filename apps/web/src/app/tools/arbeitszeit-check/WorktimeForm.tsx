"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { validateWorktimeAction, type WorktimeActionResult } from "./actions";
import { cn } from "@/lib/cn";

interface Entry {
	id: number;
	date: string;
	start: string;
	end: string;
	breakMinutes: string;
}

let nextId = 1;

function todayPlus(days: number): string {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString().split("T")[0];
}

export function WorktimeForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<WorktimeActionResult | null>(null);
	const [entries, setEntries] = useState<Entry[]>(() =>
		Array.from({ length: 5 }, (_, i) => ({
			id: nextId++,
			date: todayPlus(-7 + i),
			start: "08:00",
			end: "17:00",
			breakMinutes: "60",
		})),
	);

	function addEntry() {
		const last = entries[entries.length - 1];
		const lastDate = last ? new Date(last.date) : new Date();
		lastDate.setDate(lastDate.getDate() + 1);
		setEntries((prev) => [
			...prev,
			{
				id: nextId++,
				date: lastDate.toISOString().split("T")[0],
				start: "08:00",
				end: "17:00",
				breakMinutes: "60",
			},
		]);
	}

	function removeEntry(id: number) {
		setEntries((prev) => prev.filter((e) => e.id !== id));
	}

	function updateEntry<K extends keyof Entry>(id: number, key: K, value: Entry[K]) {
		setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [key]: value } : e)));
	}

	function handleSubmit(formData: FormData) {
		formData.set("entry_count", String(entries.length));
		entries.forEach((e, i) => {
			formData.set(`entry_date_${i}`, e.date);
			formData.set(`entry_start_${i}`, e.start);
			formData.set(`entry_end_${i}`, e.end);
			formData.set(`entry_break_${i}`, e.breakMinutes);
		});
		startTransition(async () => {
			const res = await validateWorktimeAction(formData);
			setResult(res);
		});
	}

	return (
		<div className="grid gap-8 lg:grid-cols-5">
			<form action={handleSubmit} className="lg:col-span-3 space-y-6">
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Arbeitnehmer/in
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Input label="Alter" name="age" type="number" min={14} max={75} defaultValue={30} required />
						<Select label="Branche" name="industry" defaultValue="office">
							<option value="office">Büro / Verwaltung</option>
							<option value="industrial">Industrie</option>
							<option value="retail">Detailhandel</option>
							<option value="healthcare">Gesundheitswesen</option>
							<option value="gastro">Gastgewerbe</option>
							<option value="other">Übrige</option>
						</Select>
					</div>
					<div className="mt-4 flex flex-col gap-3 border-t border-rappen-border pt-4">
						<label className="flex items-center gap-3 text-sm text-rappen-charcoal cursor-pointer">
							<input
								type="checkbox"
								name="has_night_permit"
								className="h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
							/>
							Bewilligung für Nachtarbeit (Art. 17 ArG)
						</label>
						<label className="flex items-center gap-3 text-sm text-rappen-charcoal cursor-pointer">
							<input
								type="checkbox"
								name="has_sunday_permit"
								className="h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
							/>
							Bewilligung für Sonntagsarbeit (Art. 18 ArG)
						</label>
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Zeiterfassung
					</legend>
					<div className="mt-4 space-y-3">
						{entries.map((entry, i) => (
							<div
								key={entry.id}
								className="grid grid-cols-12 gap-2 rounded-lg border border-rappen-border bg-rappen-cream/30 p-3"
							>
								<div className="col-span-12 sm:col-span-4">
									<input
										type="date"
										value={entry.date}
										onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
										className="h-10 w-full rounded-md border border-rappen-border bg-white px-3 text-sm"
										required
									/>
								</div>
								<div className="col-span-4 sm:col-span-2">
									<input
										type="time"
										value={entry.start}
										onChange={(e) => updateEntry(entry.id, "start", e.target.value)}
										className="h-10 w-full rounded-md border border-rappen-border bg-white px-3 text-sm tabular-nums"
										required
										aria-label={`Beginn Tag ${i + 1}`}
									/>
								</div>
								<div className="col-span-4 sm:col-span-2">
									<input
										type="time"
										value={entry.end}
										onChange={(e) => updateEntry(entry.id, "end", e.target.value)}
										className="h-10 w-full rounded-md border border-rappen-border bg-white px-3 text-sm tabular-nums"
										required
										aria-label={`Ende Tag ${i + 1}`}
									/>
								</div>
								<div className="col-span-3 sm:col-span-3">
									<div className="relative">
										<input
											type="number"
											min="0"
											max="240"
											value={entry.breakMinutes}
											onChange={(e) => updateEntry(entry.id, "breakMinutes", e.target.value)}
											className="h-10 w-full rounded-md border border-rappen-border bg-white pl-3 pr-12 text-sm tabular-nums"
											aria-label={`Pause Tag ${i + 1}`}
										/>
										<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-rappen-muted">
											min
										</span>
									</div>
								</div>
								<div className="col-span-1 flex items-center justify-end">
									{entries.length > 1 && (
										<button
											type="button"
											onClick={() => removeEntry(entry.id)}
											className="text-rappen-muted hover:text-rappen-red"
											aria-label={`Tag ${i + 1} entfernen`}
										>
											<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
												<path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
											</svg>
										</button>
									)}
								</div>
							</div>
						))}

						<button
							type="button"
							onClick={addEntry}
							className="w-full rounded-lg border border-dashed border-rappen-border bg-white px-4 py-3 text-sm font-medium text-rappen-charcoal hover:border-rappen-charcoal hover:bg-rappen-cream"
						>
							+ Arbeitstag hinzufügen
						</button>
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
								Erfassen Sie die Arbeitszeiten und klicken Sie auf
								<br />
								<span className="font-medium text-rappen-charcoal">„Compliance prüfen"</span>
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
								<div className="flex items-center gap-3">
									{result.data.compliant ? (
										<svg className="h-8 w-8 text-emerald-600" viewBox="0 0 32 32" fill="none">
											<circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" />
											<path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									) : (
										<svg className="h-8 w-8 text-rappen-red" viewBox="0 0 32 32" fill="none">
											<circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" />
											<path d="M16 9V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
											<circle cx="16" cy="22.5" r="1.5" fill="currentColor" />
										</svg>
									)}
									<div>
										<p className={cn(
											"text-base font-semibold",
											result.data.compliant ? "text-emerald-700" : "text-rappen-red",
										)}>
											{result.data.compliant ? "ArG-konform" : "Verstösse festgestellt"}
										</p>
										<p className="text-xs text-rappen-muted">
											{result.data.violations.length} Befund{result.data.violations.length !== 1 ? "e" : ""}
										</p>
									</div>
								</div>
							</div>

							<div className="rounded-xl border border-rappen-border bg-white p-6">
								<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
									Zusammenfassung
								</h3>
								<dl className="mt-4 space-y-3 text-sm">
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Total Arbeitsstunden</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.summary.total_hours} h
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Überzeit</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.summary.overtime_hours} h
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Nachtstunden</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.summary.night_hours} h
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-rappen-muted">Sonntagsstunden</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.summary.sunday_hours} h
										</dd>
									</div>
									<div className="flex justify-between border-t border-rappen-border pt-3">
										<dt className="text-rappen-muted">Verbleibende Jahres-Überzeit</dt>
										<dd className="font-semibold tabular-nums text-rappen-charcoal">
											{result.data.summary.annual_overtime_remaining} h
										</dd>
									</div>
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
													<div>
														<p className={cn(
															"font-semibold",
															v.severity === "error" ? "text-rappen-red" : "text-amber-800",
														)}>
															{v.rule}
														</p>
														<p className="mt-1 text-rappen-charcoal/80">{v.message}</p>
													</div>
													<span className="font-mono text-[10px] uppercase tracking-wider text-rappen-muted">
														{v.article}
													</span>
												</div>
												<p className="mt-1 text-[10px] text-rappen-muted">{v.date}</p>
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
