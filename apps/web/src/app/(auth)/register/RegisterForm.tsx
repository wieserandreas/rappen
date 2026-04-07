"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerAction, type AuthActionResult } from "../actions";

export function RegisterForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<AuthActionResult | null>(null);

	function handleSubmit(formData: FormData) {
		startTransition(async () => {
			const res = await registerAction(formData);
			setResult(res);
		});
	}

	const fieldError = (field: string) => result?.fieldErrors?.[field];

	// Email confirmation required success state
	if (result?.success && result.error === "EMAIL_CONFIRMATION_REQUIRED") {
		return (
			<div className="text-center">
				<svg
					className="mx-auto h-12 w-12 text-emerald-600"
					viewBox="0 0 32 32"
					fill="none"
					aria-hidden="true"
				>
					<circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
					<path
						d="M10 16L14 20L22 12"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				<h2 className="mt-4 text-xl font-semibold text-rappen-charcoal">
					Bestätigungslink versandt
				</h2>
				<p className="mt-3 text-sm text-rappen-muted">
					Wir haben Ihnen einen Bestätigungslink an Ihre E-Mail-Adresse geschickt.
					Klicken Sie auf den Link in der E-Mail, um Ihren Account zu aktivieren.
				</p>
			</div>
		);
	}

	return (
		<form action={handleSubmit} className="space-y-5">
			<Input
				label="Firma"
				name="company"
				autoComplete="organization"
				required
				placeholder="Beispiel AG"
				error={fieldError("company")}
			/>
			<Input
				label="E-Mail"
				name="email"
				type="email"
				autoComplete="email"
				required
				placeholder="ihre@firma.ch"
				error={fieldError("email")}
			/>
			<Input
				label="Passwort"
				name="password"
				type="password"
				autoComplete="new-password"
				required
				hint="Mind. 8 Zeichen, Gross-/Kleinbuchstaben und Ziffer."
				error={fieldError("password")}
			/>
			<Input
				label="Passwort bestätigen"
				name="password_confirm"
				type="password"
				autoComplete="new-password"
				required
				error={fieldError("password_confirm")}
			/>

			<label className="flex items-start gap-3 text-sm text-rappen-charcoal cursor-pointer">
				<input
					type="checkbox"
					name="accept_terms"
					required
					className="mt-0.5 h-4 w-4 rounded border-rappen-border text-rappen-charcoal focus:ring-rappen-charcoal"
				/>
				<span>
					Ich akzeptiere die{" "}
					<a href="/legal/agb" className="underline" target="_blank" rel="noopener">
						AGB
					</a>{" "}
					und die{" "}
					<a href="/legal/datenschutz" className="underline" target="_blank" rel="noopener">
						Datenschutzerklärung
					</a>
					.
				</span>
			</label>
			{fieldError("accept_terms") && (
				<p className="text-xs text-rappen-red" role="alert">
					{fieldError("accept_terms")}
				</p>
			)}

			{result && !result.success && result.error && !result.fieldErrors && (
				<div className="rounded-md border border-rappen-red/30 bg-rappen-red/5 p-3">
					<p className="text-sm text-rappen-red" role="alert">
						{result.error}
					</p>
				</div>
			)}

			<Button type="submit" isLoading={isPending} className="w-full">
				Account erstellen
			</Button>
		</form>
	);
}
