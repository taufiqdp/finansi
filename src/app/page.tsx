"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Overview } from "@/components/overview";
import { AddTransaction } from "@/components/add-transaction";
import { TransactionHistory } from "@/components/transaction-history";
import {
  getAllTransactions,
  addTransaction as addTransactionAction,
  deleteTransaction as deleteTransactionAction,
} from "@/app/actions";

import type { Transaction } from "@/db/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await getAllTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => {
    try {
      setIsLoading(true);
      const newTransaction = await addTransactionAction(transaction);

      setTransactions((prev) => [newTransaction, ...prev]);
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return <Overview transactions={transactions} />;
      case "add-transaction":
        return <AddTransaction onAddTransaction={addTransaction} />;
      case "transactions":
        return (
          <TransactionHistory
            transactions={transactions}
            onDeleteTransaction={deleteTransaction}
          />
        );
      default:
        return <Overview transactions={transactions} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
