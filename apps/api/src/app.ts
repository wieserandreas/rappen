import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRoutes } from "./routes/health.js";
import { payrollRoutes } from "./routes/v1/payroll.js";
import { withholdingTaxRoutes } from "./routes/v1/withholding-tax.js";
import { qrBillRoutes } from "./routes/v1/qr-bill.js";
import { vatRoutes } from "./routes/v1/vat.js";
import { worktimeRoutes } from "./routes/v1/worktime.js";
import { payEquityRoutes } from "./routes/v1/pay-equity.js";
import { contractRoutes } from "./routes/v1/contracts.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", cors({
	origin: ["http://localhost:3000", "https://rappen.ch", "https://staging.rappen.ch"],
	allowMethods: ["GET", "POST", "OPTIONS"],
	allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
}));

// Error handler
app.onError(errorHandler);

// Health check
app.route("/", healthRoutes);

// V1 API routes – Phase 1
app.route("/v1/payroll", payrollRoutes);
app.route("/v1/withholding-tax", withholdingTaxRoutes);
app.route("/v1/qr-bill", qrBillRoutes);
app.route("/v1/vat", vatRoutes);

// V1 API routes – Phase 2
app.route("/v1/worktime", worktimeRoutes);
app.route("/v1/pay-equity", payEquityRoutes);
app.route("/v1/contracts", contractRoutes);

// Phase 3 routes (stubs)
// app.route("/v1/cross-border", crossBorderRoutes);
// app.route("/v1/company-risk", companyRiskRoutes);
// app.route("/v1/temp-staffing", tempStaffingRoutes);

export { app };
