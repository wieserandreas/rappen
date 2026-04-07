import { cn } from "@/lib/cn";

interface LogoProps {
	size?: "sm" | "md" | "lg";
	withWordmark?: boolean;
	className?: string;
	mark?: "dark" | "light";
}

const sizeMap = {
	sm: { mark: 24, text: "text-base" },
	md: { mark: 32, text: "text-xl" },
	lg: { mark: 48, text: "text-3xl" },
};

/**
 * Rappen logo: stylized coin (Rappen) with subtle precision marks.
 */
export function Logo({ size = "md", withWordmark = true, className, mark = "dark" }: LogoProps) {
	const { mark: markSize, text } = sizeMap[size];
	const fillColor = mark === "dark" ? "#0a0a0a" : "#fafafa";
	const accentColor = "#c5a55a";

	return (
		<div className={cn("inline-flex items-center gap-2.5", className)}>
			<svg
				width={markSize}
				height={markSize}
				viewBox="0 0 32 32"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				{/* Outer coin ring */}
				<circle cx="16" cy="16" r="15" stroke={fillColor} strokeWidth="1.5" fill="none" />
				{/* Inner accent ring */}
				<circle cx="16" cy="16" r="11" stroke={accentColor} strokeWidth="1" fill="none" />
				{/* Stylized R */}
				<path
					d="M11 9 L11 23 M11 9 L17 9 Q20 9 20 12.5 Q20 16 17 16 L11 16 M16 16 L20.5 23"
					stroke={fillColor}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</svg>
			{withWordmark && (
				<span className={cn("font-semibold tracking-tight", text, mark === "dark" ? "text-rappen-charcoal" : "text-rappen-white")}>
					Rappen
				</span>
			)}
		</div>
	);
}
