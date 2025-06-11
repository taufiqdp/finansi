"use server";

import { components } from "@/schema/schema";

export type Transaction = components["schemas"]["TransactionCreate"];
export type TransactionResponse = components["schemas"]["TransactionResponse"];

export type Event = components["schemas"]["Event"];
export type Content = components["schemas"]["Content-Output"];

export type ChatRequest = components["schemas"]["AgentRunRequest"];
export type PartOutput = components["schemas"]["Part-Output"];

export type ChatSession = components["schemas"]["Session"];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not defined. Please set it in your environment variables."
  );
}

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response;
};

export async function getTransactions(): Promise<TransactionResponse[]> {
  try {
    const response = await apiRequest("/api/v1/transactions", {
      cache: "no-store",
    });

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return [];
    }
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions from server");
  }
}

export async function createTransaction(
  transaction: Transaction
): Promise<TransactionResponse> {
  try {
    const response = await apiRequest("/api/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    });

    return await response.json();
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("Failed to create transaction");
  }
}

export async function deleteTransaction(transactionId: number): Promise<void> {
  try {
    await apiRequest(`/api/v1/transactions/${transactionId}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      throw new Error("Transaction not found");
    }
    console.error("Error deleting transaction:", error);
    throw new Error("Failed to delete transaction");
  }
}

export async function sendChatMessage(payload: ChatRequest): Promise<Event[]> {
  try {
    const response = await apiRequest("/api/v1/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Failed to send chat message");
  }
}

export async function getChatHistory(): Promise<ChatSession[]> {
  try {
    const response = await apiRequest("/api/v1/sessions");
    const data: ChatSession[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw new Error("Failed to fetch chat history from server");
  }
}

export async function getSession(chatId: string): Promise<Event[]> {
  const response = await apiRequest(`/api/v1/session/${chatId}`);
  if (!response.ok) {
    return [];
  }
  return await response.json();
}
