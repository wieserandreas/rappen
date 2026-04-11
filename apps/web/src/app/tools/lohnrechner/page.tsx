import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { PayrollForm } from "./PayrollForm";

export const metadata: Metadata = {
	title: "Lohnrechner Schweiz",
	description:
		"Berechnen Sie den Nettolohn mit AHV, ALV, BVG, UVG und Familienzulagen für alle 26 Schweizer Kantone. Inklusive 13. Monatslohn und Bonus.",
};

export default function LohnrechnerPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="Lohnrechner"
					slug="lohnrechner"
					description="Vollständige Lohnabrechnung mit allen Sozialabgaben und Familienzulagen für die Schweiz."
					tier={1}
					limit="10 Berechnungen pro Tag (Gratis Account)"
					legalBasis="AHVG · BVG · UVG · FamZG"
				/>
				<div className="mt-12">
					<PayrollForm />
				</div>
			</Container>
		</section>
	);
}
