"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction, type AuthActionResult } from "../actions";

export function LoginForm() {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<AuthActionResult | null>(null);
	const searchParams = useSearchParams();
	const next = searchParams.get("next") ?? "/dashboard";

	function handleSubmit(formData: FormData) {
		formData.set("next", next);
		startTransition(async () => {
			const res = await loginAction(formData);
			// On success, the action redirects (this code never runs).
			// On error, we display it.
			setResult(res);
		});
	}

	const fieldError = (field: string) => result?.fieldErrors?.[field];

	return (
		<form action={handleSubmit} className="space-y-5">
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
				autoComplete="current-password"
				required
				error={fieldError("password")}
			/>

			{result && !result.success && result.error && !result.fieldErrors && (
				<div className="rounded-md border border-rappen-red/30 bg-rappen-red/5 p-3">
					<p className="text-sm text-rappen-red" role="alert">
						{result.error}
					</p>
				</div>
			)}

			<Button type="submit" isLoading={isPending} className="w-full">
				Anmelden
			</Button>

			<p className="text-center text-xs text-rappen-muted">
				Mit der Anmeldung akzeptieren Sie unsere{" "}
				<a href="/legal/agb" className="underline">AGB</a> und{" "}
				<a href="/legal/datenschutz" className="underline">Datenschutzerklärung</a>.
			</p>
		</form>
	);
}
