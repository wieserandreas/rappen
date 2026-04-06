export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a1a] text-[#fafafa]">
			<div className="text-center max-w-3xl px-6">
				<h1 className="text-6xl font-bold tracking-tight mb-4">
					<span className="text-[#c5a55a]">Rappen</span>
				</h1>
				<p className="text-2xl text-gray-300 mb-2">
					Präzision auf den letzten Rappen.
				</p>
				<p className="text-lg text-gray-400 mb-12">
					10 APIs für Schweizer Unternehmen. Lohn, Steuern, Verträge,
					Compliance – eine Schnittstelle.
				</p>
				<div className="flex gap-4 justify-center">
					<a
						href="/tools/qr-rechnung"
						className="bg-[#c5a55a] text-[#1a1a1a] font-semibold px-8 py-3 rounded-lg hover:bg-[#d4b76a] transition-colors"
					>
						Jetzt kostenlos testen
					</a>
					<a
						href="/docs"
						className="border border-gray-600 text-gray-300 font-semibold px-8 py-3 rounded-lg hover:border-gray-400 hover:text-white transition-colors"
					>
						API Dokumentation
					</a>
				</div>
				<p className="text-sm text-gray-500 mt-8">
					Alle 26 Kantone. Jeder Wert verifiziert. Jede Berechnung
					gesetzeskonform.
				</p>
			</div>
		</main>
	);
}
