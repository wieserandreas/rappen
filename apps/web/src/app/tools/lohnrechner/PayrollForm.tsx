"use client";

import { useState, useTransition } from "react";
import { CANTONS } from "@rappen/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { calculatePayrollAction, type PayrollActionResult } from "./actions";
import { formatChf } from "@/lib/format";
import { cn } from "@/lib/cn";

const CANTON_NAMES: Record<string, string> = {
	AG: "Aargau", AI: "Appenzell I.", AR: "Appenzell A.", BE: "Bern",
	BL: "Basel-Landschaft", BS: "Basel-Stadt", FR: "Freiburg", GE: "Genf",
	GL: "Glarus", GR: "Graubünden", JU: "Jura", LU: "Luzern", NE: "Neuenburg",
	NW: "Nidwalden", OW: "Obwalden", SG: "St. Gallen", SH: "Schaffhausen",
	SO: "Solothurn", SZ: "Schwyz", TG: "Thurgau", TI: "Tessin", UR: "Uri",
	VD: "Waadt", VS: "Wallis", ZG: "Zug", ZH: "Zürich",
};

export function PayrollForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<PayrollActionResult | null>(null);
	const [childCount, setChildCount] = useState(0);

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const res = await calculatePayrollAction(formData);
			setResult(res);
		});
	}

	const fieldError = (field: string) => result?.fieldErrors?.[field];

	return (
		<div className="grid gap-8 lg:grid-cols-5">
			{/* ─── Form ─── */}
			<form action={handleSubmit} className="lg:col-span-3 space-y-6">
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Grunddaten
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Select label="Kanton" name="canton" defaultValue="ZH" required>
							{CANTONS.map((c) => (
								<option key={c} value={c}>
									{c} – {CANTON_NAMES[c]}
								</option>
							))}
						</Select>
						<Input
							label="Geburtsjahr"
							name="birth_year"
							type="number"
							min={1930}
							max={2010}
							defaultValue={1990}
							required
							error={fieldError("birth_year")}
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
							label="Beschäftigungsgrad"
							name="employment_percentage"
							type="number"
							min="10"
							max="100"
							defaultValue={100}
							suffix="%"
							required
							error={fieldError("employment_percentage")}
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
							<option value="divorced">Geschieden</option>
							<option value="widowed">Verwitwet</option>
						</Select>
						<Select label="Konfession" name="church" defaultValue="keine">
							<option value="keine">Keine</option>
							<option value="reformiert">Reformiert</option>
							<option value="katholisch">Katholisch</option>
							<option value="christkatholisch">Christ-katholisch</option>
						</Select>
						<Input
							label="Anzahl Kinder"
							name="children"
							type="number"
							min="0"
							max="10"
							defaultValue={0}
							value={childCount}
							onChange={(e) => setChildCount(Math.max(0, Math.min(10, parseInt(e.target.value || "0", 10))))}
						/>
					</div>
					{childCount > 0 && (
						<div className="mt-4 grid gap-3 border-t border-rappen-border pt-4 sm:grid-cols-3">
							{Array.from({ length: childCount }).map((_, i) => (
								<Input
									key={i}
									label={`Alter Kind ${i + 1}`}
									name={`child_age_${i}`}
									type="number"
									min="0"
									max="30"
									defaultValue={5}
									suffix="J."
								/>
							))}
						</div>
					)}
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Versicherungen
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Select label="BVG-Plan" name="bvg_plan" defaultValue="minimum">
							<option value="minimum">Minimum (gesetzlich)</option>
							<option value="standard">Standard</option>
						</Select>
						<Input
							label="UVG NBU-Satz"
							name="uvg_nbu_rate"
							type="number"
							step="0.01"
							min="0"
							max="15"
							defaultValue={1.5}
							suffix="%"
							hint="Branchenabhängig"
						/>
						<Input
							label="Bonus (optional)"
							name="bonus"
							type="number"
							step="0.05"
							min="0"
							placeholder="0"
							suffix="CHF"
						/>
					</div>
					<div className="mt-4 flex flex-col gap-3 border-t border-rappen-border pt-4">
						<label className="flex items-center gap-3 text-sm text-rappen-charcoal cursor-pointer">
							<input
								type="checkbox"
								name="thirteenth_salary"
								className="h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
							/>
							13. Monatslohn
						</label>
						<label className="flex items-center gap-3 text-sm text-rappen-charcoal cursor-pointer">
							<input
								type="checkbox"
								name="withholding_tax"
								className="h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
							/>
							Quellensteuerpflichtig
						</label>
					</div>
				</fieldset>

				<Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
					Lohn berechnen
				</Button>
			</form>

			{/* ─── Result ─── */}
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
									„Lohn berechnen"
								</span>
							</p>
						</div>
					)}

					{result && !result.success && (
						<div className="rounded-xl border border-rappen-red/30 bg-rappen-red/5 p-6">
							<p className="text-sm font-semibold text-rappen-red">{result.error}</p>
						</div>
					)}

					{result?.success && result.data && <PayrollResultDisplay data={result.data} />}
				</div>
			</aside>
		</div>
	);
}

function PayrollResultDisplay({ data }: { data: NonNullable<PayrollActionResult["data"]> }) {
	return (
		<>
			<div className="rounded-xl border-2 border-rappen-charcoal bg-rappen-charcoal p-6 text-rappen-white">
				<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
					Nettolohn
				</p>
				<p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
					CHF {formatChf(data.net_salary)}
				</p>
				{parseFloat(data.child_allowances.total_monthly) > 0 && (
					<p className="mt-3 text-sm text-rappen-muted-dark">
						+ Familienzulagen CHF {formatChf(data.child_allowances.total_monthly)}
					</p>
				)}
				{parseFloat(data.child_allowances.total_monthly) > 0 && (
					<>
						<div className="my-4 border-t border-white/10" />
						<p className="text-xs uppercase tracking-wider text-rappen-muted-dark">
							Total Auszahlung
						</p>
						<p className="mt-1 text-2xl font-semibold tabular-nums">
							CHF {formatChf(data.total_payout)}
						</p>
					</>
				)}
			</div>

			<div className="rounded-xl border border-rappen-border bg-white">
				<div className="border-b border-rappen-border px-6 py-4">
					<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Aufschlüsselung
					</h3>
				</div>
				<dl className="divide-y divide-rappen-border">
					<DeductionRow label="Bruttolohn" value={data.gross_salary} bold />
					<DeductionRow label="AHV/IV/EO" value={data.ahv_iv_eo.employee} rate={data.ahv_iv_eo.rate_employee} negative />
					<DeductionRow label="ALV" value={data.alv.employee} rate={data.alv.rate_employee} negative />
					{data.alv_solidarity && (
						<DeductionRow
							label="ALV Solidarität"
							value={data.alv_solidarity.employee}
							rate={data.alv_solidarity.rate_employee}
							negative
						/>
					)}
					<DeductionRow label="BVG" value={data.bvg.employee} rate={data.bvg.rate_employee} negative />
					<DeductionRow label="UVG NBU" value={data.uvg_nbu.employee} rate={data.uvg_nbu.rate_employee} negative />
					{data.ktg && <DeductionRow label="KTG" value={data.ktg.employee} rate={data.ktg.rate_employee} negative />}
					<DeductionRow label="Total Abzüge" value={data.total_deductions} bold negative />
					<DeductionRow label="Nettolohn" value={data.net_salary} bold highlight />
				</dl>
			</div>

			<div className="rounded-xl border border-rappen-border bg-white p-6">
				<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
					Arbeitgeberkosten
				</h3>
				<dl className="mt-4 space-y-2 text-sm">
					<div className="flex justify-between">
						<dt className="text-rappen-muted">AHV / ALV / BVG / UVG / FAK</dt>
						<dd className="font-medium tabular-nums text-rappen-charcoal">
							CHF {formatChf(data.employer_costs.total)}
						</dd>
					</div>
				</dl>
				<div className="mt-4 border-t border-rappen-border pt-4">
					<div className="flex justify-between text-base">
						<dt className="font-semibold text-rappen-charcoal">Total Arbeitgeber</dt>
						<dd className="font-semibold tabular-nums text-rappen-charcoal">
							CHF {formatChf((parseFloat(data.gross_salary) + parseFloat(data.employer_costs.total)).toString())}
						</dd>
					</div>
				</div>
			</div>
		</>
	);
}

function DeductionRow({
	label,
	value,
	rate,
	negative,
	bold,
	highlight,
}: {
	label: string;
	value: string;
	rate?: string;
	negative?: boolean;
	bold?: boolean;
	highlight?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-between px-6 py-3",
				highlight && "bg-rappen-cream/50",
			)}
		>
			<div>
				<dt className={cn("text-sm", bold ? "font-semibold text-rappen-charcoal" : "text-rappen-muted")}>
					{label}
				</dt>
				{rate && <p className="text-xs text-rappen-muted/70">{rate}</p>}
			</div>
			<dd
				className={cn(
					"tabular-nums",
					bold ? "text-base font-semibold text-rappen-charcoal" : "text-sm text-rappen-charcoal",
				)}
			>
				{negative && parseFloat(value) > 0 ? "−" : ""}CHF {formatChf(value)}
			</dd>
		</div>
	);
}
