import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { VatForm } from "./VatForm";

export const metadata: Metadata = {
	title: "MWST-Rechner Schweiz",
	description:
		"Berechnen Sie die Schweizer MWST mit effektiver oder Saldosteuersatz-Methode. Mit Bezugsteuer und Optimierungstipps.",
};

export default function MwstRechnerPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="MWST-Rechner"
					slug="mwst-rechner"
					description="Effektive und Saldosteuersatz-Methode mit Bezugsteuer und Optimierungstipps."
					tier={2}
					legalBasis="MWSTG Art. 25, 28, 37, 45"
				/>
				<div className="mt-12">
					<VatForm />
				</div>
			</Container>
		</section>
	);
}
