import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	hint?: string;
	error?: string;
	suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, hint, error, suffix, className, id, ...props }, ref) => {
		const generatedId = useId();
		const inputId = id ?? generatedId;
		const hintId = hint ? `${inputId}-hint` : undefined;
		const errorId = error ? `${inputId}-error` : undefined;

		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={inputId}
						className="text-sm font-medium text-rappen-charcoal"
					>
						{label}
					</label>
				)}
				<div className="relative">
					<input
						ref={ref}
						id={inputId}
						aria-invalid={error ? "true" : undefined}
						aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
						className={cn(
							"h-11 w-full rounded-md border bg-white px-3.5 text-[15px] text-rappen-charcoal",
							"placeholder:text-rappen-muted-dark",
							"hover:border-rappen-charcoal/40",
							"focus:outline-none focus:ring-2 focus:ring-rappen-charcoal/10 focus:border-rappen-charcoal",
							"disabled:bg-rappen-cream disabled:cursor-not-allowed",
							error
								? "border-rappen-red focus:border-rappen-red focus:ring-rappen-red/10"
								: "border-rappen-border",
							suffix && "pr-12",
							className,
						)}
						{...props}
					/>
					{suffix && (
						<span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-rappen-muted">
							{suffix}
						</span>
					)}
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
Input.displayName = "Input";
