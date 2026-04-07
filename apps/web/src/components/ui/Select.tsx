import { forwardRef, type SelectHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	hint?: string;
	error?: string;
	children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, hint, error, className, id, children, ...props }, ref) => {
		const generatedId = useId();
		const selectId = id ?? generatedId;
		const hintId = hint ? `${selectId}-hint` : undefined;
		const errorId = error ? `${selectId}-error` : undefined;

		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={selectId}
						className="text-sm font-medium text-rappen-charcoal"
					>
						{label}
					</label>
				)}
				<div className="relative">
					<select
						ref={ref}
						id={selectId}
						aria-invalid={error ? "true" : undefined}
						aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
						className={cn(
							"h-11 w-full appearance-none rounded-md border bg-white pl-3.5 pr-10 text-[15px] text-rappen-charcoal",
							"hover:border-rappen-charcoal/40",
							"focus:outline-none focus:ring-2 focus:ring-rappen-charcoal/10 focus:border-rappen-charcoal",
							"disabled:bg-rappen-cream disabled:cursor-not-allowed",
							error
								? "border-rappen-red focus:border-rappen-red focus:ring-rappen-red/10"
								: "border-rappen-border",
							className,
						)}
						{...props}
					>
						{children}
					</select>
					<svg
						className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rappen-muted"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
				{hint && !error && (
					<p id={hintId} className="text-xs text-rappen-muted">
						{hint}
					</p>
				)}
				{error && (
					<p id={errorId} className="text-xs text-rappen-red" role="alert">
						{error}
					</p>
				)}
			</div>
		);
	},
);
Select.displayName = "Select";
