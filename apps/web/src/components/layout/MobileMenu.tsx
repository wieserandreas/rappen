"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const navItems = [
	{ href: "/tools", label: "Tools" },
	{ href: "/pricing", label: "Preise" },
	{ href: "/docs", label: "Dokumentation" },
] as const;

interface MobileMenuProps {
	user: { email: string } | null;
}

export function MobileMenu({ user }: MobileMenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	const close = useCallback(() => setIsOpen(false), []);

	// Close on Escape key
	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [isOpen, close]);

	// Prevent body scroll when open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	return (
		<>
			{/* Hamburger button */}
			<button
				type="button"
				className="relative z-50 flex h-10 w-10 items-center justify-center rounded-md md:hidden"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-label={isOpen ? "Menu schliessen" : "Menu oeffnen"}
				aria-expanded={isOpen}
			>
				<div className="flex h-5 w-5 flex-col items-center justify-center">
					<span
						className={`block h-0.5 w-5 rounded-full bg-rappen-charcoal transition-all duration-300 ease-in-out ${
							isOpen
								? "translate-y-[3px] rotate-45"
								: "-translate-y-1"
						}`}
					/>
					<span
						className={`block h-0.5 w-5 rounded-full bg-rappen-charcoal transition-all duration-300 ease-in-out ${
							isOpen ? "opacity-0" : "opacity-100"
						}`}
					/>
					<span
						className={`block h-0.5 w-5 rounded-full bg-rappen-charcoal transition-all duration-300 ease-in-out ${
							isOpen
								? "-translate-y-[3px] -rotate-45"
								: "translate-y-1"
						}`}
					/>
				</div>
			</button>

			{/* Overlay + Drawer */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 md:hidden"
					role="dialog"
					aria-modal="true"
					aria-label="Mobile Navigation"
				>
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-rappen-charcoal/30 backdrop-blur-sm"
						onClick={close}
					/>

					{/* Panel */}
					<nav
						className="absolute right-0 top-0 flex h-full w-72 flex-col bg-rappen-cream shadow-xl"
						style={{ animation: "mobile-menu-slide 200ms ease-out forwards" }}
					>
						{/* Spacer for header height */}
						<div className="h-16 shrink-0" />

						{/* Nav links */}
						<div className="flex flex-1 flex-col gap-1 px-6 pt-4">
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={close}
									className="rounded-md px-3 py-3 text-base font-medium text-rappen-charcoal/80 hover:bg-black/5 hover:text-rappen-charcoal"
								>
									{item.label}
								</Link>
							))}

							{/* Divider */}
							<div className="my-4 border-t border-rappen-border/60" />

							{/* Auth buttons */}
							{user ? (
								<Link href="/dashboard" onClick={close}>
									<Button size="sm" variant="primary" className="w-full">
										Zum Dashboard
									</Button>
								</Link>
							) : (
								<div className="flex flex-col gap-3">
									<Link
										href="/login"
										onClick={close}
										className="rounded-md px-3 py-3 text-center text-base font-medium text-rappen-charcoal/80 hover:bg-black/5 hover:text-rappen-charcoal"
									>
										Anmelden
									</Link>
									<Link href="/register" onClick={close}>
										<Button size="sm" variant="primary" className="w-full">
											Kostenlos starten
										</Button>
									</Link>
								</div>
							)}
						</div>
					</nav>
				</div>
			)}
		</>
	);
}
