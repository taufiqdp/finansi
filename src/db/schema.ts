import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const transactionsTable = pgTable("transactions_table", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: text("type", {
    enum: ["income", "expense"],
  }).notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;
