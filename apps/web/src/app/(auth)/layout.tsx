import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<section className="py-16 lg:py-24">
			<Container size="narrow">{children}</Container>
		</section>
	);
}
