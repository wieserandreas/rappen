import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { ContractForm } from "./ContractForm";

export const metadata: Metadata = {
	title: "Vertragsgenerator Schweiz",
	description:
		"10 Schweizer Vertragstypen nach OR. Arbeitsvertrag, NDA, Gesellschaftervertrag, B2B-Dienstleistung. DE/FR/IT/EN.",
};

export default function VertragErstellenPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="Vertragsgenerator"
					slug="vertrag-erstellen"
					description="10 Vertragstypen nach Schweizer Obligationenrecht (OR)."
					tier={2}
					legalBasis="OR Art. 319–827"
				/>
				<div className="mt-12">
					<ContractForm />
				</div>
			</Container>
		</section>
	);
}
