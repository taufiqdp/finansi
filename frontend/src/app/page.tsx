"use client";

import { Overview } from "@/components/overview";
import SidebarLayout from "@/components/sidebar-layout";
import { getTransactions } from "@/lib/actions";
import { useState, useEffect } from "react";
import type { TransactionResponse } from "@/lib/actions";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const apiTransactions = await getTransactions();

        const formattedTransactions = apiTransactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: new Date(transaction.date).toISOString().split("T")[0],
          created_at: new Date(transaction.created_at).toISOString(),
        }));

        setTransactions(formattedTransactions);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load transactions"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">Loading...</div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout breadcrumbs={[{ title: "Dashboard" }]}>
      <Overview transactions={transactions} />
    </SidebarLayout>
  );
}
