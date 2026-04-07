import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
	title: "Allgemeine Geschäftsbedingungen",
	robots: { index: false },
};

export default function AgbPage() {
	return (
		<section className="py-16">
			<Container size="narrow">
				<h1 className="text-4xl font-semibold tracking-tight text-rappen-charcoal">
					Allgemeine Geschäftsbedingungen
				</h1>
				<p className="mt-4 text-sm text-rappen-muted">
					Stand: {new Date().toLocaleDateString("de-CH")}
				</p>
				<div className="prose mt-10 max-w-none text-rappen-charcoal">
					<p className="text-rappen-muted">
						Die vollständigen AGB werden vor dem öffentlichen Launch publiziert.
						Bei Fragen wenden Sie sich bitte an{" "}
						<a href="mailto:legal@rappen.ch" className="underline">
							legal@rappen.ch
						</a>
						.
					</p>
				</div>
			</Container>
		</section>
	);
}
