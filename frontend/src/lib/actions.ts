"use server";

export type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
  userId: number;
};

const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

export async function getTransactionsByUserId(
  userId: number
): Promise<Transaction[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/transactions?userId=${userId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        // Add cache control for fresh data
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // No transactions found for user
        return [];
      }
      throw new Error(
        `Failed to fetch transactions: ${response.status} ${response.statusText}`
      );
    }

    const transactions: Transaction[] = await response.json();
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions from server");
  }
}

export async function createTransaction(transaction: {
  userId: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
}): Promise<Transaction> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create transaction: ${response.status} ${response.statusText}`
      );
    }

    const newTransaction: Transaction = await response.json();
    return newTransaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("Failed to create transaction");
  }
}

export async function deleteTransaction(transactionId: number): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/transactions/${transactionId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Transaction not found");
      }
      throw new Error(
        `Failed to delete transaction: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw new Error("Failed to delete transaction");
  }
}
