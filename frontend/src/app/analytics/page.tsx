"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/sidebar";
import { getTransactionsByUserId, Transaction } from "@/lib/actions";
import Loading from "@/components/loading";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getTransactionsByUserId(1);
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomeByCategory = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  if (loading) {
    return (
      <Sidebar
        header="Analitik Keuangan"
        description="Pantau kesehatan keuangan Anda"
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
      </Sidebar>
    );
  }

  return (
    <Sidebar
      header="Analitik Keuangan"
      description="Pantau kesehatan keuangan Anda"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pemasukan
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pengeluaran
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                -5% dari bulan lalu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo Bersih
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(netBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Arus kas {netBalance >= 0 ? "positif" : "negatif"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tingkat Tabungan
              </CardTitle>
              <PieChart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {savingsRate.toFixed(1)}%
              </div>
              <Progress value={savingsRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="cursor-pointer">
              Ringkasan
            </TabsTrigger>
            <TabsTrigger value="expenses" className="cursor-pointer">
              Pengeluaran
            </TabsTrigger>
            <TabsTrigger value="income" className="cursor-pointer">
              Pemasukan
            </TabsTrigger>
            <TabsTrigger value="trends" className="cursor-pointer">
              Tren
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
                  <CardDescription>Perbandingan bulanan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pemasukan</span>
                      <span className="text-sm text-green-600">
                        {formatCurrency(totalIncome)}
                      </span>
                    </div>
                    <Progress value={100} className="h-2 bg-green-100" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pengeluaran</span>
                      <span className="text-sm text-red-600">
                        {formatCurrency(totalExpenses)}
                      </span>
                    </div>
                    <Progress
                      value={(totalExpenses / totalIncome) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaksi Terbaru</CardTitle>
                  <CardDescription>Aktivitas keuangan terkini</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...transactions]
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .slice(0, 3)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {transaction.description}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {transaction.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-sm font-medium ${
                                transaction.type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rincian Pengeluaran</CardTitle>
                <CardDescription>
                  Pengeluaran berdasarkan kategori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(expensesByCategory).map(
                    ([category, amount]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {category}
                          </span>
                          <span className="text-sm text-red-600">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <Progress
                          value={(amount / totalExpenses) * 100}
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground">
                          {((amount / totalExpenses) * 100).toFixed(1)}% dari
                          total pengeluaran
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sumber Pemasukan</CardTitle>
                <CardDescription>
                  Pendapatan berdasarkan kategori
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(incomeByCategory).map(
                    ([category, amount]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {category}
                          </span>
                          <span className="text-sm text-green-600">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <Progress
                          value={(amount / totalIncome) * 100}
                          className="h-2 bg-green-100"
                        />
                        <div className="text-xs text-muted-foreground">
                          {((amount / totalIncome) * 100).toFixed(1)}% dari
                          total pemasukan
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kesehatan Keuangan</CardTitle>
                <CardDescription>Indikator kinerja utama</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Tingkat Tabungan
                      </span>
                      <span className="text-sm font-bold">
                        {savingsRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={savingsRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Tingkat tabungan{" "}
                      {savingsRate >= 20
                        ? "sangat baik"
                        : savingsRate >= 10
                        ? "baik"
                        : "perlu ditingkatkan"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Rasio Pengeluaran
                      </span>
                      <span className="text-sm font-bold">
                        {((totalExpenses / totalIncome) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={(totalExpenses / totalIncome) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Persentase pemasukan yang digunakan untuk pengeluaran
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {transactions.filter((t) => t.type === "income").length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Transaksi Pemasukan
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {
                          transactions.filter((t) => t.type === "expense")
                            .length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Transaksi Pengeluaran
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Sidebar>
  );
}
