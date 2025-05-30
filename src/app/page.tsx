"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Overview } from "@/components/overview";
import { AddTransaction } from "@/components/add-transaction";
import { TransactionHistory } from "@/components/transaction-history";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      amount: 3000,
      category: "Salary",
      description: "Monthly salary",
      date: "2024-01-15",
    },
    {
      id: "2",
      type: "expense",
      amount: 1200,
      category: "Rent",
      description: "Monthly rent payment",
      date: "2024-01-01",
    },
    {
      id: "3",
      type: "expense",
      amount: 300,
      category: "Groceries",
      description: "Weekly grocery shopping",
      date: "2024-01-10",
    },
    {
      id: "4",
      type: "income",
      amount: 500,
      category: "Freelance",
      description: "Web design project",
      date: "2024-01-12",
    },
  ]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const renderContent = () => {
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
