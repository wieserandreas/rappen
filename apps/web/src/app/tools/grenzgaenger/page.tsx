import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { CrossBorderForm } from "./CrossBorderForm";

export const metadata: Metadata = {
	title: "Grenzgänger-Analyse Schweiz",
	description:
		"DBA-Analyse mit DE/FR/IT/AT/LI, Telework-Schwellen, A1-Bescheinigung und LEADS-Reporting.",
};

export default function GrenzgaengerPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="Grenzgänger"
					slug="grenzgaenger"
					description="DBA-Analyse, Telework-Schwellen und Sozialversicherungs-Koordination."
					tier={2}
					legalBasis="VO 883/2004 · DBA CH-DE/FR/IT/AT"
				/>
				<div className="mt-12">
					<CrossBorderForm />
				</div>
			</Container>
		</section>
	);
}
