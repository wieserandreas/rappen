import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
	transpilePackages: ["@rappen/shared", "@rappen/swiss-data"],

	// Include the ESTV tariff data files in the deployment.
	// They are read at runtime via fs.readFileSync from the swiss-data loader.
	outputFileTracingIncludes: {
		"/tools/quellensteuer": ["../../packages/swiss-data/data/qst-2026/*.json.gz"],
		"/tools/lohnrechner": ["../../packages/swiss-data/data/qst-2026/*.json.gz"],
		// API routes that may also use QST data
		"/api/**": ["../../packages/swiss-data/data/qst-2026/*.json.gz"],
	},

	// Set monorepo root explicitly so Vercel resolves workspace paths correctly
	outputFileTracingRoot: join(process.cwd(), "..", ".."),

	webpack: (config) => {
		// Allow TypeScript imports with .js extensions (NodeNext style used in workspace packages)
		config.resolve.extensionAlias = {
			".js": [".ts", ".tsx", ".js", ".jsx"],
			".mjs": [".mts", ".mjs"],
		};
		return config;
	},
};

export default nextConfig;
