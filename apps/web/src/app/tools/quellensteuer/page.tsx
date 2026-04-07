import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { QstForm } from "./QstForm";

export const metadata: Metadata = {
	title: "Quellensteuer-Rechner Schweiz",
	description:
		"Berechnen Sie die Schweizer Quellensteuer mit Tarifen A–H, Kirchensteuer und 13. Monatslohn-Anpassung. Alle 26 Kantone.",
};

export default function QuellensteuerPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="Quellensteuer"
					description="Berechnung der Quellensteuer mit Tarifen A–H, Kirchensteuer und 13. Monatslohn."
					tier={1}
					limit="10 Berechnungen pro Tag (Gratis Account)"
				/>
				<div className="mt-12">
					<QstForm />
				</div>
			</Container>
		</section>
	);
}
