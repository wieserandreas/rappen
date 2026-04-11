import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { TempStaffingForm } from "./TempStaffingForm";

export const metadata: Metadata = {
	title: "Personalverleih-Compliance",
	description:
		"AVG-Compliance-Check mit SECO-Lizenz, Kaution, Einsatzdauer und Equal-Pay-Prüfung.",
};

export default function PersonalverleihPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="Personalverleih"
					slug="personalverleih"
					description="AVG-Compliance: Lizenz, Kaution, Einsatzdauer und Equal Pay."
					tier={2}
					legalBasis="AVG Art. 12–22"
				/>
				<div className="mt-12">
					<TempStaffingForm />
				</div>
			</Container>
		</section>
	);
}
