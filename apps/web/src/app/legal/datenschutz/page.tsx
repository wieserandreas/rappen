import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
	title: "Datenschutz",
	robots: { index: false },
};

export default function DatenschutzPage() {
	return (
		<section className="py-16">
			<Container size="narrow">
				<h1 className="text-4xl font-semibold tracking-tight text-rappen-charcoal">
					Datenschutzerklärung
				</h1>
				<p className="mt-4 text-sm text-rappen-muted">
					Stand: {new Date().toLocaleDateString("de-CH")}
				</p>
				<div className="prose mt-10 max-w-none text-rappen-charcoal">
					<p className="text-rappen-muted">
						Rappen verarbeitet Daten ausschliesslich gemäss revidiertem Schweizer
						Datenschutzgesetz (revDSG) und der EU-DSGVO. Berechnungs-Inputs werden
						nicht persistent gespeichert. Die vollständige Datenschutzerklärung
						wird vor dem öffentlichen Launch publiziert.
					</p>
				</div>
			</Container>
		</section>
	);
}
