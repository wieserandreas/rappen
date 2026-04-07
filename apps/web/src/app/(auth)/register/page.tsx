import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
	title: "Kostenlos registrieren",
	description:
		"Erstellen Sie einen kostenlosen Rappen-Account. Sofort Lohnrechner, Quellensteuer und QR-Rechnung nutzen.",
	robots: { index: false },
};

export default function RegisterPage() {
	return (
		<div className="mx-auto max-w-md">
			<div className="text-center">
				<h1 className="text-4xl font-semibold tracking-tight text-rappen-charcoal">
					Account erstellen
				</h1>
				<p className="mt-3 text-sm text-rappen-muted">
					Bereits registriert?{" "}
					<Link
						href="/login"
						className="font-medium text-rappen-charcoal underline hover:text-rappen-gold"
					>
						Hier anmelden
					</Link>
				</p>
			</div>

			<div className="mt-10 rounded-xl border border-rappen-border bg-white p-8">
				<RegisterForm />
			</div>

			<p className="mt-6 text-center text-xs text-rappen-muted">
				Kostenlos. Keine Kreditkarte erforderlich.
				<br />
				10 Lohnberechnungen pro Tag inklusive.
			</p>
		</div>
	);
}
