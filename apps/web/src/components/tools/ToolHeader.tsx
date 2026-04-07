import Link from "next/link";
import { cn } from "@/lib/cn";

interface ToolHeaderProps {
	title: string;
	description: string;
	tier: 0 | 1 | 2;
	limit?: string;
}

const tierLabels: Record<number, { label: string; className: string }> = {
	0: { label: "Ohne Account · Kostenlos", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
	1: { label: "Gratis Account", className: "bg-blue-50 text-blue-700 border-blue-200" },
	2: { label: "Bezahlt", className: "bg-amber-50 text-amber-800 border-amber-200" },
};

export function ToolHeader({ title, description, tier, limit }: ToolHeaderProps) {
	const label = tierLabels[tier];
	return (
		<div className="border-b border-rappen-border pb-8">
			<nav className="text-sm" aria-label="Breadcrumb">
				<ol className="flex items-center gap-2 text-rappen-muted">
					<li>
						<Link href="/tools" className="hover:text-rappen-charcoal">
							Tools
						</Link>
					</li>
					<li aria-hidden="true">/</li>
					<li className="text-rappen-charcoal">{title}</li>
				</ol>
			</nav>
			<div className="mt-6 flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-4xl font-semibold tracking-tight text-rappen-charcoal lg:text-5xl">
						{title}
					</h1>
					<p className="mt-3 max-w-2xl text-lg text-rappen-muted">{description}</p>
				</div>
				<div className="flex flex-col items-end gap-2">
					<span
						className={cn(
							"inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
							label.className,
						)}
					>
						{label.label}
					</span>
					{limit && <span className="text-xs text-rappen-muted">{limit}</span>}
				</div>
			</div>
		</div>
	);
}
