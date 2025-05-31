import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transactionsTable = sqliteTable("transactions_table", {
  id: int("id").primaryKey({ autoIncrement: true }),
  type: text("type", {
    enum: ["income", "expense"],
  }).notNull(),
  amount: int("amount").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;
