"use server";

type MessageRole = "user" | "model";

export type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
};

export type MessagePart = {
  text?: string;
  functionCall?: unknown;
  functionResponse?: unknown;
};

export type Message = {
  id: string;
  role: "user" | "model";
  parts: MessagePart[];
  content: string;
  timestamp: number;
  loading?: boolean;
};

export type SessionEvent = {
  id: string;
  content: {
    parts: MessagePart[];
    role: "user" | "model";
  };
  timestamp: number;
  author: string;
};

export type ChatSession = {
  id: string;
  appName: string;
  userId: string;
  state: Record<string, unknown>;
  events: SessionEvent[];
  lastUpdateTime: number;
};

type ChatHistoryResponse = {
  sessions: ChatSession[];
};

type CreateTransactionPayload = {
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
};

type SendMessagePayload = {
  session_id: string | string[] | undefined;
  new_message: {
    parts: { text: string }[];
    role: "user";
  };
  streaming: boolean;
};

interface ResponseContent {
  role: MessageRole;
  parts: MessagePart[];
}

export interface Response {
  id: string;
  timestamp: number;
  content: ResponseContent;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

export async function getTransactions(): Promise<Transaction[]> {
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
  transaction: CreateTransactionPayload
): Promise<Transaction> {
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

export async function sendChatMessage(payload: SendMessagePayload) {
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
    const data: ChatHistoryResponse = await response.json();
    return data.sessions;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw new Error("Failed to fetch chat history from server");
  }
}

export async function getSession(chatId: string): Promise<Response[]> {
  const response = await apiRequest(`/api/v1/session/${chatId}`);
  if (!response.ok) {
    return [];
  }
  return await response.json();
}
