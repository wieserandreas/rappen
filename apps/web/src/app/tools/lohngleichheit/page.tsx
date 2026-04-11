import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { PayEquityForm } from "./PayEquityForm";

export const metadata: Metadata = {
	title: "Lohngleichheitsanalyse Schweiz",
	description:
		"Logib-konforme Lohngleichheitsanalyse nach GlG. Blinder-Oaxaca-Regression in 30 Sekunden.",
};

export default function LohngleichheitPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="Lohngleichheit"
					slug="lohngleichheit"
					description="Logib-konforme Analyse mit Blinder-Oaxaca-Regression nach GlG Art. 13."
					tier={2}
					legalBasis="GlG Art. 13 · Logib (EBG)"
				/>
				<div className="mt-12">
					<PayEquityForm />
				</div>
			</Container>
		</section>
	);
}
