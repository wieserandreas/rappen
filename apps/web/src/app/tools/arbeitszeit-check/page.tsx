import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { WorktimeForm } from "./WorktimeForm";

export const metadata: Metadata = {
	title: "Arbeitszeit-Check Schweiz",
	description:
		"Prüfen Sie Arbeitszeiten gegen das Schweizer Arbeitsgesetz (ArG). Höchstarbeitszeit, Pausen, Nachtarbeit, Sonntagsarbeit, Jugendschutz.",
};

export default function ArbeitszeitCheckPage() {
	return (
		<section className="py-12">
			<Container size="wide">
				<ToolHeader
					title="Arbeitszeit-Check"
					description="Compliance-Prüfung gegen das Arbeitsgesetz (ArG) Art. 9–36."
					tier={2}
				/>
				<div className="mt-12">
					<WorktimeForm />
				</div>
			</Container>
		</section>
	);
}
