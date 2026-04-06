import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["tests/**/*.test.ts", "packages/**/*.test.ts"],
		coverage: {
			provider: "v8",
			include: ["packages/swiss-data/src/**", "apps/api/src/**"],
			thresholds: {
				lines: 95,
				functions: 95,
				branches: 90,
			},
		},
	},
	resolve: {
		alias: {
			"@rappen/swiss-data": "./packages/swiss-data/src",
			"@rappen/shared": "./packages/shared/src",
			"@rappen/db": "./packages/db/src",
		},
	},
});
