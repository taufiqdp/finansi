"use client";

import { Overview } from "@/components/overview";
import SidebarLayout from "@/components/sidebar-layout";
import { getTransactions } from "@/lib/actions";
import { useState, useEffect } from "react";
import type { TransactionResponse } from "@/lib/actions";
import Loading from "@/components/loading";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
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
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  return (
    <SidebarLayout breadcrumbs={[{ title: "Dashboard" }]}>
      {loading ? (
        <Loading description="Memuat data transaksi..." />
      ) : (
        <Overview transactions={transactions} />
      )}
    </SidebarLayout>
  );
}
