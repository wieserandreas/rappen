"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { searchCompanyAction, type CompanyRiskActionResult } from "./actions";
import { cn } from "@/lib/cn";

const RISK_LEVEL_LABELS: Record<string, { label: string; color: string }> = {
	low: { label: "Niedriges Risiko", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
	medium: { label: "Mittleres Risiko", color: "text-yellow-800 bg-yellow-50 border-yellow-200" },
	elevated: { label: "Erhöhtes Risiko", color: "text-orange-700 bg-orange-50 border-orange-200" },
	high: { label: "Hohes Risiko", color: "text-rappen-red bg-rappen-red/5 border-rappen-red/30" },
};

export function CompanySearchForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<CompanyRiskActionResult | null>(null);
	const [query, setQuery] = useState("");

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const res = await searchCompanyAction(formData);
			setResult(res);
		});
	}

	return (
		<div className="space-y-8">
			<form action={handleSubmit}>
				<div className="rounded-xl border border-rappen-border bg-white p-6">
					<label htmlFor="query" className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Firma suchen
					</label>
					<div className="mt-3 flex gap-3">
						<input
							id="query"
							name="query"
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="UID (CHE-xxx.xxx.xxx) oder Firmenname"
							required
							className="h-12 flex-1 rounded-md border border-rappen-border bg-white px-4 text-base text-rappen-charcoal placeholder:text-rappen-muted-dark focus:outline-none focus:ring-2 focus:ring-rappen-charcoal/10 focus:border-rappen-charcoal"
						/>
						<Button type="submit" size="lg" isLoading={isPending}>
							Prüfen
						</Button>
					</div>
					<p className="mt-3 text-xs text-rappen-muted">
						Suchen Sie nach Firmennamen (z.B. «Novartis», «Roche», «ABB») oder
						UID (CHE-xxx.xxx.xxx). Daten via ZEFIX, dem öffentlichen
						Firmensuchportal des Bundes.
					</p>
				</div>
			</form>

			{result && !result.success && (
				<div className="rounded-xl border border-rappen-red/30 bg-rappen-red/5 p-6">
					<p className="whitespace-pre-line text-sm text-rappen-red">{result.error}</p>
				</div>
			)}

			{result?.success && result.data && <RiskReport data={result.data} />}
		</div>
	);
}

function RiskReport({ data }: { data: NonNullable<CompanyRiskActionResult["data"]> }) {
	const riskLabel = RISK_LEVEL_LABELS[data.risk_level];

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			<div className="lg:col-span-2 space-y-6">
				<div className="rounded-xl border border-rappen-border bg-white p-6">
					<div className="flex items-start justify-between">
						<div>
							<p className="font-mono text-xs text-rappen-muted">{data.company.uid}</p>
							<h2 className="mt-1 text-2xl font-semibold text-rappen-charcoal">
								{data.company.name}
							</h2>
							<p className="text-sm text-rappen-muted">
								{data.company.legal_form} · {data.company.domicile}
							</p>
						</div>
						<span
							className={cn(
								"inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
								riskLabel.color,
							)}
						>
							{riskLabel.label}
						</span>
					</div>
					<dl className="mt-6 grid grid-cols-2 gap-4 border-t border-rappen-border pt-6 sm:grid-cols-4">
						<div>
							<dt className="text-xs uppercase tracking-wider text-rappen-muted">Status</dt>
							<dd className="mt-1 text-sm font-medium text-rappen-charcoal">{data.company.status}</dd>
						</div>
						<div>
							<dt className="text-xs uppercase tracking-wider text-rappen-muted">Kapital</dt>
							<dd className="mt-1 text-sm font-medium tabular-nums text-rappen-charcoal">
								{data.company.capital}
							</dd>
						</div>
						<div>
							<dt className="text-xs uppercase tracking-wider text-rappen-muted">Gegründet</dt>
							<dd className="mt-1 text-sm font-medium text-rappen-charcoal">
								{new Date(data.company.founding_date).toLocaleDateString("de-CH")}
							</dd>
						</div>
						<div>
							<dt className="text-xs uppercase tracking-wider text-rappen-muted">Verwaltungsrat</dt>
							<dd className="mt-1 text-sm font-medium tabular-nums text-rappen-charcoal">
								{data.board_members.length}
							</dd>
						</div>
					</dl>
				</div>

				{data.signals.length > 0 && (
					<div className="rounded-xl border border-rappen-border bg-white p-6">
						<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
							Risiko-Signale
						</h3>
						<ul className="mt-4 space-y-3">
							{data.signals.map((s, i) => (
								<li
									key={i}
									className={cn(
										"flex items-start justify-between gap-4 rounded-lg border p-3 text-sm",
										s.severity === "critical"
											? "border-rappen-red/30 bg-rappen-red/5"
											: s.severity === "warning"
												? "border-amber-200 bg-amber-50"
												: "border-rappen-border bg-rappen-cream/30",
									)}
								>
									<div>
										<p className="font-medium text-rappen-charcoal">{s.description}</p>
										<p className="mt-1 text-xs text-rappen-muted">{s.date}</p>
									</div>
									<span
										className={cn(
											"flex-shrink-0 font-mono text-sm font-semibold tabular-nums",
											s.impact_points > 0 ? "text-emerald-700" : "text-rappen-red",
										)}
									>
										{s.impact_points > 0 ? "+" : ""}{s.impact_points}
									</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{data.shab_publications.length > 0 && (
					<div className="rounded-xl border border-rappen-border bg-white p-6">
						<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
							SHAB-Publikationen
						</h3>
						<ul className="mt-4 space-y-3">
							{data.shab_publications.map((p) => (
								<li key={p.shab_id} className="border-l-2 border-rappen-gold pl-4">
									<p className="text-xs text-rappen-muted">{p.date} · {p.type}</p>
									<p className="text-sm text-rappen-charcoal">{p.message}</p>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			<aside className="lg:col-span-1">
				<div className="sticky top-24">
					<div className="rounded-xl border-2 border-rappen-charcoal bg-rappen-charcoal p-8 text-center text-rappen-white">
						<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
							Risiko-Score
						</p>
						<p className="mt-3 text-7xl font-semibold tracking-tight tabular-nums">
							{data.risk_score}
						</p>
						<p className="mt-1 text-sm text-rappen-muted-dark">/ 100</p>
						<div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
							<div
								className={cn(
									"h-full rounded-full",
									data.risk_score >= 80
										? "bg-emerald-500"
										: data.risk_score >= 50
											? "bg-yellow-500"
											: data.risk_score >= 20
												? "bg-orange-500"
												: "bg-rappen-red",
								)}
								style={{ width: `${data.risk_score}%` }}
							/>
						</div>
					</div>
				</div>
			</aside>
		</div>
	);
}
