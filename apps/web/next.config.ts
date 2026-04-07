import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@rappen/shared", "@rappen/swiss-data"],
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
