import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
	title: "Anmelden",
	description: "Melden Sie sich bei Ihrem Rappen-Account an.",
	robots: { index: false },
};

export default function LoginPage() {
	return (
		<div className="mx-auto max-w-md">
			<div className="text-center">
				<h1 className="text-4xl font-semibold tracking-tight text-rappen-charcoal">
					Anmelden
				</h1>
				<p className="mt-3 text-sm text-rappen-muted">
					Noch kein Account?{" "}
					<Link
						href="/register"
						className="font-medium text-rappen-charcoal underline hover:text-rappen-gold"
					>
						Kostenlos registrieren
					</Link>
				</p>
			</div>

			<div className="mt-10 rounded-xl border border-rappen-border bg-white p-8">
				<Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-rappen-cream" />}>
					<LoginForm />
				</Suspense>
			</div>
		</div>
	);
}
