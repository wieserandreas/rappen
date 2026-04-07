import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logoutAction } from "../(auth)/actions";

export const metadata: Metadata = {
	title: "Dashboard",
	robots: { index: false },
};

export default async function DashboardPage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	const company = (user.user_metadata?.company as string) || "—";
	const plan = (user.user_metadata?.plan as string) || "free";

	return (
		<section className="py-12">
			<Container size="wide">
				<div className="flex flex-wrap items-start justify-between gap-4 border-b border-rappen-border pb-8">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
							Dashboard
						</p>
						<h1 className="mt-2 text-4xl font-semibold tracking-tight text-rappen-charcoal">
							Willkommen, {company}
						</h1>
						<p className="mt-2 text-sm text-rappen-muted">
							Angemeldet als {user.email}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<span className="inline-flex items-center rounded-full border border-rappen-border bg-white px-3 py-1 text-xs font-medium text-rappen-charcoal">
							Plan: {plan === "free" ? "Gratis" : plan}
						</span>
						<form action={logoutAction}>
							<Button type="submit" variant="ghost" size="sm">
								Abmelden
							</Button>
						</form>
					</div>
				</div>

				<div className="mt-12 grid gap-6 md:grid-cols-3">
					<Link
						href="/tools/lohnrechner"
						className="rounded-xl border border-rappen-border bg-white p-6 hover:border-rappen-charcoal hover:shadow-md"
					>
						<h2 className="text-lg font-semibold text-rappen-charcoal">Lohnrechner</h2>
						<p className="mt-2 text-sm text-rappen-muted">
							Vollständige Lohnabrechnung für alle 26 Kantone.
						</p>
					</Link>
					<Link
						href="/tools/quellensteuer"
						className="rounded-xl border border-rappen-border bg-white p-6 hover:border-rappen-charcoal hover:shadow-md"
					>
						<h2 className="text-lg font-semibold text-rappen-charcoal">Quellensteuer</h2>
						<p className="mt-2 text-sm text-rappen-muted">
							Tarifcodes A–H mit Kirchensteuer-Variante.
						</p>
					</Link>
					<Link
						href="/tools/qr-rechnung"
						className="rounded-xl border border-rappen-border bg-white p-6 hover:border-rappen-charcoal hover:shadow-md"
					>
						<h2 className="text-lg font-semibold text-rappen-charcoal">QR-Rechnung</h2>
						<p className="mt-2 text-sm text-rappen-muted">
							SIX QR-Bill v2.3, unbegrenzt nutzbar.
						</p>
					</Link>
				</div>

				<div className="mt-8 rounded-xl border border-rappen-border bg-white p-6">
					<h2 className="text-base font-semibold text-rappen-charcoal">
						Mehr Tools verfügbar
					</h2>
					<p className="mt-2 text-sm text-rappen-muted">
						Mit Ihrem Gratis-Account stehen Ihnen 3 Tools zur Verfügung. Für die
						restlichen 7 APIs (MWST, Verträge, Lohngleichheit, Arbeitszeit,
						Grenzgänger, Firmen-Check, Personalverleih) benötigen Sie einen
						bezahlten Plan.
					</p>
					<div className="mt-4">
						<Link href="/pricing">
							<Button variant="primary" size="sm">
								Pläne ansehen
							</Button>
						</Link>
					</div>
				</div>
			</Container>
		</section>
	);
}
