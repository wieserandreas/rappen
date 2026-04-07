import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	size?: "default" | "narrow" | "wide";
}

const sizes = {
	narrow: "max-w-3xl",
	default: "max-w-6xl",
	wide: "max-w-7xl",
};

export function Container({ children, size = "default", className, ...props }: ContainerProps) {
	return (
		<div className={cn("mx-auto px-6 lg:px-8", sizes[size], className)} {...props}>
			{children}
		</div>
	);
}
