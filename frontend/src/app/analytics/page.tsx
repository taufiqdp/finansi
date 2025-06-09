"use client";

import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { getTransactions, TransactionResponse } from "@/lib/actions";
import Loading from "@/components/loading";
import Cards from "@/components/cards";
import TabsAnalytics from "@/components/tabs-analytics";
import SidebarLayout from "@/components/sidebar-layout";

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <SidebarLayout
        breadcrumbs={[{ title: "Dashboard", href: "/" }, { title: "Analitik" }]}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Loading description="Memuat..." />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      breadcrumbs={[{ title: "Dashboard", href: "/" }, { title: "Analitik" }]}
    >
      <div className="space-y-6">
        <Cards transactions={transactions} />

        <TabsAnalytics transactions={transactions} />
      </div>
    </SidebarLayout>
  );
}
