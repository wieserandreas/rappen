"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { calculateVatAction, type VatActionResult } from "./actions";
import { formatChf } from "@/lib/format";

interface Transaction {
	id: number;
	description: string;
	amount: string;
	rate_type: "normal" | "reduced" | "accommodation" | "exempt";
	is_export: boolean;
	is_import: boolean;
}

let nextId = 1;

const SALDO_RATES = [
	{ code: "01", label: "Lebensmittelhandel (0.1%)" },
	{ code: "07", label: "Beherbergung (3.5%)" },
	{ code: "08", label: "Restauration (5.1%)" },
	{ code: "09", label: "Detailhandel Non-Food (2.8%)" },
	{ code: "10", label: "Bauhauptgewerbe (5.9%)" },
	{ code: "16", label: "Autogewerbe (3.5%)" },
	{ code: "18", label: "Reinigung (6.4%)" },
	{ code: "20", label: "Informatik / Beratung (6.4%)" },
	{ code: "21", label: "Architektur / Ingenieur (6.1%)" },
	{ code: "22", label: "Recht / Treuhand (6.4%)" },
];

export function VatForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<VatActionResult | null>(null);
	const [method, setMethod] = useState<"effective" | "saldo">("effective");
	const [transactions, setTransactions] = useState<Transaction[]>([
		{ id: nextId++, description: "", amount: "", rate_type: "normal", is_export: false, is_import: false },
	]);

	function addTransaction() {
		setTransactions((prev) => [
			...prev,
			{ id: nextId++, description: "", amount: "", rate_type: "normal", is_export: false, is_import: false },
		]);
	}

	function removeTransaction(id: number) {
		setTransactions((prev) => prev.filter((tx) => tx.id !== id));
	}

	function updateTransaction<K extends keyof Transaction>(id: number, key: K, value: Transaction[K]) {
		setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...tx, [key]: value } : tx)));
	}

	function handleSubmit(formData: FormData) {
		formData.set("transaction_count", String(transactions.length));
		transactions.forEach((tx, i) => {
			formData.set(`tx_description_${i}`, tx.description);
			formData.set(`tx_amount_${i}`, tx.amount);
			formData.set(`tx_rate_${i}`, tx.rate_type);
			if (tx.is_export) formData.set(`tx_export_${i}`, "on");
			if (tx.is_import) formData.set(`tx_import_${i}`, "on");
		});

		startTransition(async () => {
			const res = await calculateVatAction(formData);
			setResult(res);
		});
	}

	return (
		<div className="grid gap-8 lg:grid-cols-5">
			<form action={handleSubmit} className="lg:col-span-3 space-y-6">
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Methode & Periode
					</legend>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<Select
							label="Berechnungsmethode"
							name="method"
							value={method}
							onChange={(e) => setMethod(e.target.value as "effective" | "saldo")}
						>
							<option value="effective">Effektive Methode</option>
							<option value="saldo">Saldosteuersatz-Methode</option>
						</Select>
						{method === "saldo" && (
							<Select label="Saldosteuersatz" name="saldo_rate_code" required>
								<option value="">Bitte wählen…</option>
								{SALDO_RATES.map((r) => (
									<option key={r.code} value={r.code}>
										{r.label}
									</option>
								))}
							</Select>
						)}
						<Input
							label="Periode von"
							name="period_from"
							type="date"
							defaultValue="2026-01-01"
							required
						/>
						<Input
							label="Periode bis"
							name="period_to"
							type="date"
							defaultValue="2026-03-31"
							required
						/>
					</div>
					<div className="mt-4 border-t border-rappen-border pt-4">
						<label className="flex items-center gap-3 text-sm text-rappen-charcoal cursor-pointer">
							<input
								type="checkbox"
								name="include_reverse_charge"
								className="h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
							/>
							Bezugsteuer für Auslandsdienstleistungen einbeziehen (Art. 45 MWSTG)
						</label>
					</div>
				</fieldset>

				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Transaktionen
					</legend>
					<div className="mt-4 space-y-4">
						{transactions.map((tx, i) => (
							<div key={tx.id} className="rounded-lg border border-rappen-border bg-rappen-cream/30 p-4">
								<div className="flex items-start justify-between">
									<span className="text-xs font-semibold uppercase tracking-wider text-rappen-muted">
										Transaktion {i + 1}
									</span>
									{transactions.length > 1 && (
										<button
											type="button"
											onClick={() => removeTransaction(tx.id)}
											className="text-xs text-rappen-red hover:underline"
										>
											Entfernen
										</button>
									)}
								</div>
								<div className="mt-3 grid gap-3 sm:grid-cols-5">
									<div className="sm:col-span-2">
										<Input
											label="Beschreibung"
											value={tx.description}
											onChange={(e) => updateTransaction(tx.id, "description", e.target.value)}
											placeholder="Beratungsleistung Q1"
											required
										/>
									</div>
									<Input
										label="Betrag"
										type="number"
										step="0.05"
										min="0"
										value={tx.amount}
										onChange={(e) => updateTransaction(tx.id, "amount", e.target.value)}
										suffix="CHF"
										required
									/>
									<div className="sm:col-span-2">
										<Select
											label="MWST-Satz"
											value={tx.rate_type}
											onChange={(e) =>
												updateTransaction(tx.id, "rate_type", e.target.value as Transaction["rate_type"])
											}
										>
											<option value="normal">Normal (8.1%)</option>
											<option value="reduced">Reduziert (2.6%)</option>
											<option value="accommodation">Beherbergung (3.8%)</option>
											<option value="exempt">Befreit (0%)</option>
										</Select>
									</div>
								</div>
								<div className="mt-3 flex flex-wrap gap-4">
									<label className="flex items-center gap-2 text-xs text-rappen-charcoal cursor-pointer">
										<input
											type="checkbox"
											checked={tx.is_export}
											onChange={(e) => updateTransaction(tx.id, "is_export", e.target.checked)}
											className="h-3.5 w-3.5 rounded border-rappen-border"
										/>
										Export (Art. 23 MWSTG)
									</label>
									<label className="flex items-center gap-2 text-xs text-rappen-charcoal cursor-pointer">
										<input
											type="checkbox"
											checked={tx.is_import}
											onChange={(e) => updateTransaction(tx.id, "is_import", e.target.checked)}
											className="h-3.5 w-3.5 rounded border-rappen-border"
										/>
										Import / Bezugsteuer
									</label>
								</div>
							</div>
						))}

						<button
							type="button"
							onClick={addTransaction}
							className="w-full rounded-lg border border-dashed border-rappen-border bg-white px-4 py-3 text-sm font-medium text-rappen-charcoal hover:border-rappen-charcoal hover:bg-rappen-cream"
						>
							+ Transaktion hinzufügen
						</button>
					</div>
				</fieldset>

				<Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
					MWST berechnen
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
								Geben Sie Ihre Transaktionen ein und klicken Sie auf
								<br />
								<span className="font-medium text-rappen-charcoal">„MWST berechnen"</span>
							</p>
						</div>
					)}

					{result && !result.success && (
						<div className="rounded-xl border border-rappen-red/30 bg-rappen-red/5 p-6">
							<p className="text-sm font-semibold text-rappen-red">{result.error}</p>
						</div>
					)}

					{result?.success && result.data && <VatResultDisplay data={result.data} />}
				</div>
			</aside>
		</div>
	);
}

function VatResultDisplay({ data }: { data: NonNullable<VatActionResult["data"]> }) {
	return (
		<>
			<div className="rounded-xl border-2 border-rappen-charcoal bg-rappen-charcoal p-6 text-rappen-white">
				<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
					MWST geschuldet
				</p>
				<p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
					CHF {formatChf(data.vat_payable)}
				</p>
				<div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs">
					<div>
						<p className="uppercase tracking-wider text-rappen-muted-dark">Umsatz</p>
						<p className="mt-1 text-lg font-medium tabular-nums">CHF {formatChf(data.total_revenue)}</p>
					</div>
					<div>
						<p className="uppercase tracking-wider text-rappen-muted-dark">MWST eingenommen</p>
						<p className="mt-1 text-lg font-medium tabular-nums">CHF {formatChf(data.total_vat_collected)}</p>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-rappen-border bg-white">
				<div className="border-b border-rappen-border px-6 py-4">
					<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Aufschlüsselung
					</h3>
				</div>
				<dl className="divide-y divide-rappen-border">
					{data.breakdown.map((line, i) => (
						<div key={i} className="flex items-center justify-between px-6 py-3">
							<div>
								<dt className="text-sm font-medium text-rappen-charcoal">
									{rateTypeLabel(line.rate_type)}
								</dt>
								<p className="text-xs text-rappen-muted">
									Bemessung: CHF {formatChf(line.taxable_amount)} · Satz {line.rate}
								</p>
							</div>
							<dd className="text-sm font-semibold tabular-nums text-rappen-charcoal">
								CHF {formatChf(line.vat_amount)}
							</dd>
						</div>
					))}
					{data.reverse_charge && (
						<div className="flex items-center justify-between bg-amber-50 px-6 py-3">
							<dt className="text-sm font-medium text-amber-900">Bezugsteuer</dt>
							<dd className="text-sm font-semibold tabular-nums text-amber-900">
								CHF {formatChf(data.reverse_charge)}
							</dd>
						</div>
					)}
				</dl>
			</div>

			{data.optimization_tips.length > 0 && (
				<div className="rounded-xl border border-rappen-border bg-white p-6">
					<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Optimierungstipps
					</h3>
					<ul className="mt-3 space-y-2 text-sm text-rappen-charcoal">
						{data.optimization_tips.map((tip, i) => (
							<li key={i} className="flex gap-2">
								<span className="text-rappen-gold">•</span>
								<span>{tip}</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</>
	);
}

function rateTypeLabel(type: string): string {
	switch (type) {
		case "normal":
			return "Normalsatz";
		case "reduced":
			return "Reduzierter Satz";
		case "accommodation":
			return "Beherbergungssatz";
		case "exempt":
			return "Befreit";
		default:
			return type;
	}
}
