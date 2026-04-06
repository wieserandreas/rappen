import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Rappen – Präzision auf den letzten Rappen",
	description:
		"10 APIs für Schweizer Unternehmen. Lohn, Steuern, Verträge, Compliance – eine Schnittstelle.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="de">
			<body className={inter.className}>{children}</body>
		</html>
	);
}
