"use server";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { transactionsTable } from "@/db/schema";
import type { Transaction, NewTransaction } from "@/db/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export async function getAllTransactions(): Promise<Transaction[]> {
  const transactions = await db.select().from(transactionsTable);
  return transactions;
}

export async function getTransactionsByUserId(
  userId: number
): Promise<Transaction[]> {
  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId));
  return transactions;
}

export async function addTransaction(
  transaction: Omit<Transaction, "id" | "createdAt" | "userId">,
  userId: number
): Promise<Transaction> {
  const newTransaction: NewTransaction = {
    ...transaction,
    userId,
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
