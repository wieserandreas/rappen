"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { generateQrBillAction, type QrBillActionResult } from "./actions";
import { formatChfPrefixed } from "@/lib/format";

export function QrBillForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<QrBillActionResult | null>(null);
	const [referenceType, setReferenceType] = useState<"QRR" | "SCOR" | "NON">("NON");

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const res = await generateQrBillAction(formData);
			setResult(res);
		});
	}

	const fieldError = (field: string) => result?.fieldErrors?.[field];

	return (
		<div className="grid gap-8 lg:grid-cols-5">
			{/* ─── Form ─── */}
			<form action={handleSubmit} className="lg:col-span-3 space-y-8">
				{/* Creditor */}
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Zahlungsempfänger
					</legend>
					<div className="mt-4 grid gap-4">
						<Input
							label="Name"
							name="creditor_name"
							placeholder="Rappen AG"
							required
							maxLength={70}
							error={fieldError("creditor.name")}
						/>
						<div className="grid grid-cols-3 gap-3">
							<div className="col-span-2">
								<Input
									label="Strasse"
									name="creditor_street"
									placeholder="Bahnhofstrasse"
									required
									maxLength={70}
									error={fieldError("creditor.street")}
								/>
							</div>
							<Input
								label="Hausnr."
								name="creditor_building"
								placeholder="10"
								maxLength={16}
								error={fieldError("creditor.building_number")}
							/>
						</div>
						<div className="grid grid-cols-3 gap-3">
							<Input
								label="PLZ"
								name="creditor_postal"
								placeholder="8001"
								required
								maxLength={16}
								error={fieldError("creditor.postal_code")}
							/>
							<div className="col-span-2">
								<Input
									label="Ort"
									name="creditor_city"
									placeholder="Zürich"
									required
									maxLength={35}
									error={fieldError("creditor.city")}
								/>
							</div>
						</div>
						<Input
							label="Land"
							name="creditor_country"
							defaultValue="CH"
							maxLength={2}
							hint="ISO-Code (z.B. CH, DE, FR)"
							error={fieldError("creditor.country")}
						/>
					</div>
				</fieldset>

				{/* Account & Amount */}
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Zahlung
					</legend>
					<div className="mt-4 grid gap-4">
						<Input
							label="IBAN"
							name="iban"
							placeholder="CH44 3199 9123 0008 8901 2"
							required
							hint="Schweizer IBAN. QR-IBAN für QR-Referenz erforderlich."
							error={fieldError("iban")}
						/>
						<div className="grid grid-cols-3 gap-3">
							<div className="col-span-2">
								<Input
									label="Betrag"
									name="amount"
									type="number"
									step="0.05"
									min="0"
									placeholder="1500.50"
									suffix="CHF"
									error={fieldError("amount")}
								/>
							</div>
							<Select label="Währung" name="currency" defaultValue="CHF">
								<option value="CHF">CHF</option>
								<option value="EUR">EUR</option>
							</Select>
						</div>
						<Select
							label="Referenztyp"
							name="reference_type"
							value={referenceType}
							onChange={(e) => setReferenceType(e.target.value as "QRR" | "SCOR" | "NON")}
						>
							<option value="NON">Ohne Referenz</option>
							<option value="QRR">QR-Referenz (27-stellig, benötigt QR-IBAN)</option>
							<option value="SCOR">Creditor Reference (ISO 11649)</option>
						</Select>
						{referenceType !== "NON" && (
							<Input
								label="Referenz"
								name="reference"
								placeholder={referenceType === "QRR" ? "210000000003139471430009017" : "RF18 5390 0754 7034"}
								error={fieldError("reference")}
							/>
						)}
						<Input
							label="Mitteilung (optional)"
							name="additional_info"
							placeholder="Rechnung Nr. 2026-0042"
							maxLength={140}
							error={fieldError("additional_info")}
						/>
					</div>
				</fieldset>

				{/* Debtor */}
				<fieldset className="rounded-xl border border-rappen-border bg-white p-6">
					<legend className="px-2 text-sm font-semibold uppercase tracking-wider text-rappen-gold">
						Zahlungspflichtiger (optional)
					</legend>
					<div className="mt-4 grid gap-4">
						<Input label="Name" name="debtor_name" placeholder="Max Muster" maxLength={70} />
						<div className="grid grid-cols-3 gap-3">
							<div className="col-span-2">
								<Input label="Strasse" name="debtor_street" placeholder="Seestrasse" maxLength={70} />
							</div>
							<Input label="Hausnr." name="debtor_building" placeholder="5" maxLength={16} />
						</div>
						<div className="grid grid-cols-3 gap-3">
							<Input label="PLZ" name="debtor_postal" placeholder="8002" maxLength={16} />
							<div className="col-span-2">
								<Input label="Ort" name="debtor_city" placeholder="Zürich" maxLength={35} />
							</div>
						</div>
						<Input label="Land" name="debtor_country" defaultValue="CH" maxLength={2} />
					</div>
				</fieldset>

				<Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
					QR-Rechnung erstellen
				</Button>
			</form>

			{/* ─── Result ─── */}
			<aside className="lg:col-span-2">
				<div className="sticky top-24">
					<div className="rounded-xl border border-rappen-border bg-white p-6">
						<h3 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold">
							Ergebnis
						</h3>

						{!result && (
							<div className="mt-6 rounded-lg border border-dashed border-rappen-border bg-rappen-cream/50 p-8 text-center">
								<p className="text-sm text-rappen-muted">
									Füllen Sie das Formular aus und klicken Sie auf
									<br />
									<span className="font-medium text-rappen-charcoal">
										„QR-Rechnung erstellen"
									</span>
								</p>
							</div>
						)}

						{result && !result.success && (
							<div className="mt-6 rounded-lg border border-rappen-red/30 bg-rappen-red/5 p-4">
								<div className="flex items-start gap-3">
									<svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-rappen-red" viewBox="0 0 20 20" fill="none" aria-hidden="true">
										<circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
										<path d="M10 6V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
										<circle cx="10" cy="14" r="0.75" fill="currentColor" />
									</svg>
									<div>
										<p className="text-sm font-semibold text-rappen-red">{result.error}</p>
										{result.validation?.errors && result.validation.errors.length > 0 && (
											<ul className="mt-2 space-y-1 text-xs text-rappen-red/90">
												{result.validation.errors.map((e, i) => (
													<li key={i}>· {e.message}</li>
												))}
											</ul>
										)}
									</div>
								</div>
							</div>
						)}

						{result?.success && (
							<div className="mt-6 space-y-4">
								<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
									<div className="flex items-center gap-2">
										<svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="none" aria-hidden="true">
											<circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
											<path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
										<p className="text-sm font-semibold text-emerald-700">
											QR-Rechnung gültig
										</p>
									</div>
									{result.validation?.warnings && result.validation.warnings.length > 0 && (
										<ul className="mt-3 space-y-1 text-xs text-emerald-700/80">
											{result.validation.warnings.map((w, i) => (
												<li key={i}>· {w.message}</li>
											))}
										</ul>
									)}
								</div>

								<div>
									<p className="text-xs font-medium uppercase tracking-wider text-rappen-muted">
										QR-Code Payload (SPC v2.3)
									</p>
									<pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-rappen-charcoal p-4 font-mono text-[11px] leading-relaxed text-rappen-white">
										{result.qrPayload}
									</pre>
								</div>

								<p className="text-xs text-rappen-muted">
									Die QR-Daten entsprechen dem SIX SPC v2.3 Standard und
									können direkt in QR-Code-Generatoren verwendet werden.
								</p>
							</div>
						)}
					</div>
				</div>
			</aside>
		</div>
	);
}
