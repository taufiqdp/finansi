"use server";

export type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined. Please set it in your environment variables."
  );
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/transactions`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

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

type SendMessagePayload = {
  session_id: string | string[] | undefined;
  new_message: {
    parts: { text: string }[];
    role: "user";
  };
  streaming: boolean;
};

export async function sendChatMessage(payload: SendMessagePayload) {
  const response = await fetch(`${API_BASE_URL}/api/v1/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
