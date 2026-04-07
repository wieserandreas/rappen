import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "./Container";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navItems = [
	{ href: "/tools", label: "Tools" },
	{ href: "/pricing", label: "Preise" },
	{ href: "/docs", label: "Dokumentation" },
] as const;

export async function Header() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<header className="sticky top-0 z-50 border-b border-rappen-border/80 bg-rappen-cream/85 backdrop-blur-md">
			<Container size="wide">
				<div className="flex h-16 items-center justify-between">
					<Link href="/" className="flex items-center" aria-label="Rappen Startseite">
						<Logo size="md" />
					</Link>

					<nav
						className="hidden md:flex md:items-center md:gap-1"
						aria-label="Hauptnavigation"
					>
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="rounded-md px-4 py-2 text-sm font-medium text-rappen-charcoal/80 hover:bg-black/5 hover:text-rappen-charcoal"
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className="flex items-center gap-2">
						{user ? (
							<Link href="/dashboard">
								<Button size="sm" variant="primary">
									Zum Dashboard
								</Button>
							</Link>
						) : (
							<>
								<Link
									href="/login"
									className="hidden text-sm font-medium text-rappen-charcoal/80 hover:text-rappen-charcoal sm:inline-block"
								>
									Anmelden
								</Link>
								<Link href="/register">
									<Button size="sm" variant="primary">
										Kostenlos starten
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</Container>
		</header>
	);
}
