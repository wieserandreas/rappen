import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { QrBillForm } from "./QrBillForm";

export const metadata: Metadata = {
	title: "QR-Rechnung erstellen",
	description:
		"Erstellen Sie kostenlos Schweizer QR-Rechnungen nach SIX-Standard v2.3. Ohne Anmeldung. Mit Validierung und QR-Payload-Export.",
};

export default function QrRechnungPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="QR-Rechnung"
					slug="qr-rechnung"
					description="Erstellen und validieren Sie Schweizer QR-Rechnungen nach SIX-Standard v2.3."
					tier={0}
					limit="3 Rechnungen pro Tag"
					legalBasis="SIX QR-Bill v2.3"
				/>
				<div className="mt-12">
					<QrBillForm />
				</div>
			</Container>
		</section>
	);
}
