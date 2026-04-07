import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
	primary:
		"bg-rappen-charcoal text-rappen-white hover:bg-rappen-charcoal-light disabled:bg-rappen-charcoal/50 shadow-sm",
	secondary:
		"bg-rappen-gold text-rappen-charcoal hover:bg-rappen-gold-light disabled:bg-rappen-gold/50 shadow-sm font-semibold",
	outline:
		"border border-rappen-charcoal text-rappen-charcoal hover:bg-rappen-charcoal hover:text-rappen-white",
	ghost: "text-rappen-charcoal hover:bg-black/5",
};

const sizes: Record<ButtonSize, string> = {
	sm: "h-9 px-4 text-sm",
	md: "h-11 px-6 text-[15px]",
	lg: "h-13 px-8 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			children,
			className,
			variant = "primary",
			size = "md",
			isLoading,
			leftIcon,
			rightIcon,
			disabled,
			...props
		},
		ref,
	) => {
		return (
			<button
				ref={ref}
				disabled={disabled || isLoading}
				className={cn(
					"inline-flex items-center justify-center gap-2 rounded-md font-medium",
					"disabled:cursor-not-allowed",
					"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rappen-charcoal",
					variants[variant],
					sizes[size],
					className,
				)}
				{...props}
			>
				{isLoading ? (
					<span
						className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
						aria-hidden="true"
					/>
				) : (
					leftIcon
				)}
				{children}
				{!isLoading && rightIcon}
			</button>
		);
	},
);
Button.displayName = "Button";
