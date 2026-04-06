import { pgTable, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const usage = pgTable("usage", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	user_id: text("user_id").references(() => users.id),
	api: varchar("api", { length: 50 }).notNull(), // "payroll", "qst", "qr-bill", etc.
	endpoint: varchar("endpoint", { length: 255 }).notNull(),
	status_code: integer("status_code").notNull(),
	response_time_ms: integer("response_time_ms"),
	ip_address: varchar("ip_address", { length: 45 }),
	created_at: timestamp("created_at").notNull().defaultNow(),
});
