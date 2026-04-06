import { pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const apiKeys = pgTable("api_keys", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	user_id: text("user_id").notNull().references(() => users.id),
	name: varchar("name", { length: 255 }).notNull(),
	key_hash: varchar("key_hash", { length: 255 }).notNull().unique(),
	key_prefix: varchar("key_prefix", { length: 10 }).notNull(), // "rp_live_" or "rp_test_"
	is_active: boolean("is_active").notNull().default(true),
	last_used_at: timestamp("last_used_at"),
	created_at: timestamp("created_at").notNull().defaultNow(),
});
