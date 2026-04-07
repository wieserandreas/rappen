import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://rappen.ch"),
	title: {
		default: "Rappen – Präzision auf den letzten Rappen",
		template: "%s · Rappen",
	},
	description:
		"10 APIs für Schweizer Unternehmen. Lohn, Quellensteuer, QR-Rechnung, MWST, Verträge – eine Schnittstelle. Alle 26 Kantone. Gesetzeskonform.",
	keywords: [
		"Schweizer Lohnrechner",
		"Quellensteuer Rechner",
		"QR-Rechnung Generator",
		"MWST Schweiz",
		"Lohnausweis API",
		"Schweizer Payroll API",
	],
	authors: [{ name: "Rappen" }],
	creator: "Rappen",
	publisher: "Rappen",
	openGraph: {
		type: "website",
		locale: "de_CH",
		url: "https://rappen.ch",
		siteName: "Rappen",
		title: "Rappen – Präzision auf den letzten Rappen",
		description:
			"10 APIs für Schweizer Unternehmen. Lohn, Steuern, Verträge, Compliance – eine Schnittstelle.",
	},
	twitter: {
		card: "summary_large_image",
		title: "Rappen – Präzision auf den letzten Rappen",
		description:
			"10 APIs für Schweizer Unternehmen. Lohn, Steuern, Verträge, Compliance – eine Schnittstelle.",
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="de-CH" className={inter.variable}>
			<body className="min-h-screen flex flex-col font-sans antialiased">
				<Header />
				<main className="flex-1">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
