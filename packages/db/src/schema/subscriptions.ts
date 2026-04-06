import { pgTable, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const subscriptions = pgTable("subscriptions", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	user_id: text("user_id").notNull().references(() => users.id).unique(),
	stripe_subscription_id: varchar("stripe_subscription_id", { length: 255 }).notNull().unique(),
	stripe_price_id: varchar("stripe_price_id", { length: 255 }).notNull(),
	plan: varchar("plan", { length: 50 }).notNull(), // "starter", "business", "professional", "enterprise"
	status: varchar("status", { length: 50 }).notNull(), // "active", "cancelled", "past_due"
	monthly_api_limit: integer("monthly_api_limit").notNull(),
	current_period_start: timestamp("current_period_start").notNull(),
	current_period_end: timestamp("current_period_end").notNull(),
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
});
