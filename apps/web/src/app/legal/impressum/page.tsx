import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
	title: "Impressum",
	robots: { index: false },
};

export default function ImpressumPage() {
	return (
		<section className="py-16">
			<Container size="narrow">
				<h1 className="text-4xl font-semibold tracking-tight text-rappen-charcoal">
					Impressum
				</h1>
				<div className="mt-10 space-y-4 text-rappen-charcoal">
					<p>
						<strong>Rappen</strong>
						<br />
						Schweiz
					</p>
					<p>
						E-Mail:{" "}
						<a href="mailto:hello@rappen.ch" className="underline">
							hello@rappen.ch
						</a>
					</p>
					<p className="text-sm text-rappen-muted">
						Vollständige Angaben werden vor dem öffentlichen Launch publiziert.
					</p>
				</div>
			</Container>
		</section>
	);
}
