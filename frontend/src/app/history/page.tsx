"use client";

import { TransactionHistory } from "@/components/transaction-history";
import {
  deleteTransaction as deleteTransactionAction,
  getTransactionsByUserId,
} from "@/app/actions";
import { useEffect, useState } from "react";
import { Transaction } from "@/db/schema";

export default function HistoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await getTransactionsByUserId(1); // Replace with actual user ID logic
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const deleteTransaction = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteTransactionAction(id);

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return isLoading ? (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ) : (
    <TransactionHistory
      onDeleteTransaction={deleteTransaction}
      transactions={transactions}
    />
  );
}
