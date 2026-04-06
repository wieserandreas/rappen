import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = parseInt(process.env.PORT || "8787", 10);

console.log(`🪙 Rappen API starting on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});

console.log(`🪙 Rappen API running at http://localhost:${port}`);
