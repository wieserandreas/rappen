import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"rounded-lg border border-rappen-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function CardHeader({ children, className, ...props }: CardProps) {
	return (
		<div className={cn("border-b border-rappen-border px-6 py-5", className)} {...props}>
			{children}
		</div>
	);
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
	return <h3 className={cn("text-lg font-semibold text-rappen-charcoal", className)}>{children}</h3>;
}

export function CardDescription({ children }: { children: ReactNode }) {
	return <p className="mt-1 text-sm text-rappen-muted">{children}</p>;
}

export function CardBody({ children, className, ...props }: CardProps) {
	return (
		<div className={cn("px-6 py-5", className)} {...props}>
			{children}
		</div>
	);
}

export function CardFooter({ children, className, ...props }: CardProps) {
	return (
		<div className={cn("border-t border-rappen-border bg-rappen-cream/50 px-6 py-4", className)} {...props}>
			{children}
		</div>
	);
}
