import { pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

export const auditLog = pgTable("audit_log", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	user_id: text("user_id"),
	action: varchar("action", { length: 100 }).notNull(),
	resource: varchar("resource", { length: 100 }).notNull(),
	details: jsonb("details"),
	ip_address: varchar("ip_address", { length: 45 }),
	created_at: timestamp("created_at").notNull().defaultNow(),
});
