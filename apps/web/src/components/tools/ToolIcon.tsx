import { cn } from "@/lib/cn";

/**
 * Unique icon + color identity for each of the 10 tools.
 * Rendered as inline SVGs for pixel-perfect crispness at any size.
 */

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

interface ToolIconProps {
	slug: ToolSlug;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const ICON_COLORS: Record<ToolSlug, { bg: string; fg: string }> = {
	"qr-rechnung": { bg: "bg-violet-100", fg: "text-violet-600" },
	"lohnrechner": { bg: "bg-blue-100", fg: "text-blue-600" },
	"quellensteuer": { bg: "bg-sky-100", fg: "text-sky-600" },
	"mwst-rechner": { bg: "bg-emerald-100", fg: "text-emerald-600" },
	"arbeitszeit-check": { bg: "bg-amber-100", fg: "text-amber-600" },
	"lohngleichheit": { bg: "bg-rose-100", fg: "text-rose-600" },
	"vertrag-erstellen": { bg: "bg-indigo-100", fg: "text-indigo-600" },
	"grenzgaenger": { bg: "bg-teal-100", fg: "text-teal-600" },
	"firmen-check": { bg: "bg-orange-100", fg: "text-orange-600" },
	"personalverleih": { bg: "bg-fuchsia-100", fg: "text-fuchsia-600" },
};

const SIZES = {
	sm: "h-8 w-8 p-1.5",
	md: "h-10 w-10 p-2",
	lg: "h-12 w-12 p-2.5",
};

/**
 * Each icon is a distinctive 24×24 SVG path that represents the tool's function.
 * Stroked (not filled) for consistency.
 */
function getIconPath(slug: ToolSlug): string {
	switch (slug) {
		// QR-Rechnung: QR code grid
		case "qr-rechnung":
			return "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 17h3v3M17 14h3v3M14 14h1v1";
		// Lohnrechner: calculator
		case "lohnrechner":
			return "M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1zM8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0";
		// Quellensteuer: tax bracket / percentage
		case "quellensteuer":
			return "M12 2v20M7 5l10 14M17 5L7 19M4 8h16M4 16h16";
		// MWST: receipt with checkmark
		case "mwst-rechner":
			return "M6 2h12l2 4v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6l2-4zM9 11l2 2 4-4M8 16h8";
		// Arbeitszeit: clock
		case "arbeitszeit-check":
			return "M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2";
		// Lohngleichheit: balance scale
		case "lohngleichheit":
			return "M12 3v18M5 7l7-3 7 3M3 12a5 5 0 005 5M16 12a5 5 0 005 5M3 12h5M16 12h5";
		// Verträge: document with pen
		case "vertrag-erstellen":
			return "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M8 13h8M8 17h5";
		// Grenzgänger: globe with arrow
		case "grenzgaenger":
			return "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10M12 2a15 15 0 00-4 10 15 15 0 004 10";
		// Firmen-Check: shield with checkmark
		case "firmen-check":
			return "M12 2l8 4v6c0 5.5-3.5 10-8 12-4.5-2-8-6.5-8-12V6l8-4zM9 12l2 2 4-4";
		// Personalverleih: people / team
		case "personalverleih":
			return "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75";
	}
}

export function ToolIcon({ slug, size = "md", className }: ToolIconProps) {
	const colors = ICON_COLORS[slug];
	const path = getIconPath(slug);

	return (
		<div
			className={cn(
				"flex-shrink-0 rounded-lg flex items-center justify-center",
				colors.bg,
				SIZES[size],
				className,
			)}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={cn("w-full h-full", colors.fg)}
				aria-hidden="true"
			>
				<path d={path} />
			</svg>
		</div>
	);
}
