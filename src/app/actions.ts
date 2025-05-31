"use server";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { transactionsTable } from "@/db/schema";
import type { Transaction, NewTransaction } from "@/db/schema";

const sqlite3db = new Database("./local.db");
const db = drizzle(sqlite3db);

export async function getAllTransactions(): Promise<Transaction[]> {
  const transactions = await db.select().from(transactionsTable);
  return transactions;
}

export async function addTransaction(
  transaction: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  const newTransaction: NewTransaction = {
    ...transaction,
  };

  const result = await db
    .insert(transactionsTable)
    .values(newTransaction)
    .returning();
  return result[0];
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.delete(transactionsTable).where(eq(transactionsTable.id, id));
}
