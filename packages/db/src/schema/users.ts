import { pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text("id").primaryKey(), // Clerk user ID
	email: varchar("email", { length: 255 }).notNull().unique(),
	name: varchar("name", { length: 255 }),
	company: varchar("company", { length: 255 }),
	plan: varchar("plan", { length: 50 }).notNull().default("free"),
	stripe_customer_id: varchar("stripe_customer_id", { length: 255 }),
	is_active: boolean("is_active").notNull().default(true),
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
});
