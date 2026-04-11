import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ToolIcon } from "@/components/tools/ToolIcon";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logoutAction } from "../(auth)/actions";

export const metadata: Metadata = {
	title: "Dashboard",
	robots: { index: false },
};

const FREE_TOOLS = [
	{
		slug: "qr-rechnung" as const,
		name: "QR-Rechnung",
		description: "Erstellen und validieren",
		limit: "Unbegrenzt",
	},
	{
		slug: "lohnrechner" as const,
		name: "Lohnrechner",
		description: "Alle 26 Kantone",
		limit: "10 / Tag",
	},
	{
		slug: "quellensteuer" as const,
		name: "Quellensteuer",
		description: "ESTV-Tarife 2026",
		limit: "10 / Tag",
	},
];

const PRO_TOOLS = [
	{ slug: "mwst-rechner" as const, name: "MWST-Rechner" },
	{ slug: "arbeitszeit-check" as const, name: "Arbeitszeit" },
	{ slug: "lohngleichheit" as const, name: "Lohngleichheit" },
	{ slug: "vertrag-erstellen" as const, name: "Verträge" },
	{ slug: "grenzgaenger" as const, name: "Grenzgänger" },
	{ slug: "firmen-check" as const, name: "Firmen-Check" },
	{ slug: "personalverleih" as const, name: "Personalverleih" },
];

export default async function DashboardPage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	const company = (user.user_metadata?.company as string) || "Ihr Unternehmen";
	const plan = (user.user_metadata?.plan as string) || "free";
	const isPaid = plan !== "free";
	const createdAt = user.created_at
		? new Date(user.created_at).toLocaleDateString("de-CH", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: null;

	return (
		<section className="py-12">
			<Container size="wide">
				{/* Header */}
				<div className="flex flex-wrap items-start justify-between gap-4 pb-8">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-rappen-gold">
							Dashboard
						</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-rappen-charcoal lg:text-4xl">
							{company}
						</h1>
						<p className="mt-1 text-sm text-rappen-muted">{user.email}</p>
					</div>
					<div className="flex items-center gap-3">
						<span className="inline-flex items-center rounded-full border border-rappen-border bg-white px-3 py-1.5 text-xs font-medium text-rappen-charcoal">
							{isPaid ? `Plan: ${plan}` : "Gratis-Plan"}
						</span>
						<form action={logoutAction}>
							<Button type="submit" variant="ghost" size="sm">
								Abmelden
							</Button>
						</form>
					</div>
				</div>

				{/* Stats */}
				<div className="grid gap-4 sm:grid-cols-3 mb-10">
					<div className="rounded-xl border border-rappen-border bg-white p-5">
						<p className="text-xs uppercase tracking-wider text-rappen-muted">Plan</p>
						<p className="mt-1 text-2xl font-semibold text-rappen-charcoal">
							{isPaid ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Gratis"}
						</p>
						{!isPaid && (
							<Link
								href="/pricing"
								className="mt-2 inline-block text-xs font-medium text-rappen-gold hover:underline"
							>
								Upgrade →
							</Link>
						)}
					</div>
					<div className="rounded-xl border border-rappen-border bg-white p-5">
						<p className="text-xs uppercase tracking-wider text-rappen-muted">
							Verfügbare APIs
						</p>
						<p className="mt-1 text-2xl font-semibold tabular-nums text-rappen-charcoal">
							{isPaid ? "10" : "3"}
							<span className="text-base font-normal text-rappen-muted"> / 10</span>
						</p>
					</div>
					<div className="rounded-xl border border-rappen-border bg-white p-5">
						<p className="text-xs uppercase tracking-wider text-rappen-muted">
							Mitglied seit
						</p>
						<p className="mt-1 text-lg font-semibold text-rappen-charcoal">
							{createdAt || "—"}
						</p>
					</div>
				</div>

				{/* Included Tools */}
				<div className="mb-10">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-rappen-gold mb-4">
						Ihre Tools
					</h2>
					<div className="grid gap-4 sm:grid-cols-3">
						{FREE_TOOLS.map((tool) => (
							<Link
								key={tool.slug}
								href={`/tools/${tool.slug}`}
								className="group flex items-start gap-4 rounded-xl border border-rappen-border bg-white p-5 transition-all hover:border-rappen-charcoal/40 hover:shadow-lg hover:shadow-black/5"
							>
								<ToolIcon slug={tool.slug} size="md" />
								<div className="flex-1 min-w-0">
									<h3 className="text-base font-semibold text-rappen-charcoal">
										{tool.name}
									</h3>
									<p className="text-xs text-rappen-muted">{tool.description}</p>
									<p className="mt-2 text-[10px] uppercase tracking-wider text-rappen-muted/60">
										Limit: {tool.limit}
									</p>
								</div>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									className="mt-1 text-rappen-muted/40 group-hover:text-rappen-charcoal transition-colors"
								>
									<path
										d="M6 4L10 8L6 12"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</Link>
						))}
					</div>
				</div>

				{/* Locked Tools */}
				{!isPaid && (
					<div>
						<h2 className="text-sm font-semibold uppercase tracking-wider text-rappen-muted/70 mb-4">
							Mit Upgrade verfügbar
						</h2>
						<div className="rounded-xl border border-rappen-border bg-white p-6">
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
								{PRO_TOOLS.map((tool) => (
									<div
										key={tool.slug}
										className="flex items-center gap-3 rounded-lg bg-rappen-cream/50 p-3"
									>
										<ToolIcon slug={tool.slug} size="sm" className="opacity-40" />
										<span className="text-sm text-rappen-muted">{tool.name}</span>
									</div>
								))}
							</div>
							<div className="mt-6 flex items-center justify-between border-t border-rappen-border pt-4">
								<p className="text-sm text-rappen-muted">
									Ab CHF 149/Mo für alle 10 APIs
								</p>
								<Link href="/pricing">
									<Button variant="primary" size="sm">
										Pläne vergleichen
									</Button>
								</Link>
							</div>
						</div>
					</div>
				)}

				{/* API Docs link */}
				<div className="mt-10 rounded-xl border border-rappen-border bg-white p-8 text-center">
					<h3 className="text-base font-semibold text-rappen-charcoal">
						API-Integration
					</h3>
					<p className="mt-2 text-sm text-rappen-muted max-w-md mx-auto">
						Integrieren Sie die Rappen APIs direkt in Ihre Software.
						Authentifizierung via API-Key, JSON-Responses, alle 26 Kantone.
					</p>
					<Link href="/docs">
						<Button variant="outline" size="sm" className="mt-4">
							API-Dokumentation ansehen
						</Button>
					</Link>
				</div>
			</Container>
		</section>
	);
}
