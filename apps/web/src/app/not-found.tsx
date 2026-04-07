import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
	return (
		<section className="py-32">
			<Container size="narrow">
				<div className="text-center">
					<p className="font-mono text-xs uppercase tracking-wider text-rappen-gold">
						Fehler 404
					</p>
					<h1 className="mt-4 text-6xl font-semibold tracking-tight text-rappen-charcoal lg:text-7xl">
						Seite nicht gefunden
					</h1>
					<p className="mx-auto mt-6 max-w-md text-lg text-rappen-muted">
						Die gesuchte Seite existiert nicht oder wurde verschoben. Auf den
						Rappen genau – aber leider nicht auf diesen Pfad.
					</p>
					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<Link href="/">
							<Button variant="primary">Zur Startseite</Button>
						</Link>
						<Link href="/tools">
							<Button variant="ghost">Tools ansehen →</Button>
						</Link>
					</div>
				</div>
			</Container>
		</section>
	);
}
