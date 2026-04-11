import Link from "next/link";
import { cn } from "@/lib/cn";
import { ToolIcon } from "./ToolIcon";

type ToolSlug =
	| "qr-rechnung"
	| "lohnrechner"
	| "quellensteuer"
	| "mwst-rechner"
	| "arbeitszeit-check"
	| "lohngleichheit"
	| "vertrag-erstellen"
	| "grenzgaenger"
	| "firmen-check"
	| "personalverleih";

interface ToolHeaderProps {
	title: string;
	slug: ToolSlug;
	description: string;
	tier: 0 | 1 | 2;
	limit?: string;
	legalBasis?: string;
}

const tierLabels: Record<number, { label: string; className: string }> = {
	0: {
		label: "Ohne Account · Kostenlos",
		className: "bg-emerald-50 text-emerald-700 border-emerald-200",
	},
	1: {
		label: "Gratis Account",
		className: "bg-blue-50 text-blue-700 border-blue-200",
	},
	2: {
		label: "Pro / Business",
		className: "bg-rappen-charcoal/5 text-rappen-charcoal border-rappen-charcoal/20",
	},
};

export function ToolHeader({ title, slug, description, tier, limit, legalBasis }: ToolHeaderProps) {
	const label = tierLabels[tier];
	return (
		<div className="border-b border-rappen-border pb-8">
			<nav className="text-sm" aria-label="Breadcrumb">
				<ol className="flex items-center gap-2 text-rappen-muted">
					<li>
						<Link href="/tools" className="hover:text-rappen-charcoal transition-colors">
							Tools
						</Link>
					</li>
					<li aria-hidden="true">
						<svg width="12" height="12" viewBox="0 0 12 12" className="text-rappen-muted/50">
							<path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</li>
					<li className="text-rappen-charcoal font-medium">{title}</li>
				</ol>
			</nav>

			<div className="mt-6 flex flex-wrap items-start justify-between gap-6">
				<div className="flex items-start gap-4">
					<ToolIcon slug={slug} size="lg" />
					<div>
						<h1 className="text-3xl font-semibold tracking-tight text-rappen-charcoal lg:text-4xl">
							{title}
						</h1>
						<p className="mt-2 max-w-2xl text-base text-rappen-muted leading-relaxed">
							{description}
						</p>
						{legalBasis && (
							<p className="mt-2 font-mono text-xs text-rappen-muted/60 uppercase tracking-wider">
								{legalBasis}
							</p>
						)}
					</div>
				</div>
				<div className="flex flex-col items-end gap-2">
					<span
						className={cn(
							"inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium",
							label.className,
						)}
					>
						{label.label}
					</span>
					{limit && (
						<span className="text-xs text-rappen-muted">{limit}</span>
					)}
				</div>
			</div>
		</div>
	);
}
