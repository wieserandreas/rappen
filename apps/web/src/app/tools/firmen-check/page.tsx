import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { CompanySearchForm } from "./CompanySearchForm";

export const metadata: Metadata = {
	title: "Firmen-Check Schweiz",
	description:
		"Risiko-Score für Schweizer Firmen aus ZEFIX, SHAB und UID-Register. Konkurssignale, VR-Wechsel, Kapitalveränderungen.",
};

export default function FirmenCheckPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="Firmen-Check"
					slug="firmen-check"
					description="Risiko-Score aus ZEFIX, SHAB und UID-Register."
					tier={2}
					legalBasis="ZEFIX · SHAB · UID-Register"
				/>
				<div className="mt-12">
					<CompanySearchForm />
				</div>
			</Container>
		</section>
	);
}
