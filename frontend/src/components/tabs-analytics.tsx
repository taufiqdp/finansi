import { Transaction } from "@/lib/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function TabsAnalytics({
  transactions,
}: {
  transactions: Transaction[];
}) {
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

  return (
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
                      new Date(b.date).getTime() - new Date(a.date).getTime()
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
            <CardDescription>Pengeluaran berdasarkan kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-red-600">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <Progress
                    value={(amount / totalExpenses) * 100}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    {((amount / totalExpenses) * 100).toFixed(1)}% dari total
                    pengeluaran
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="income" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sumber Pemasukan</CardTitle>
            <CardDescription>Pendapatan berdasarkan kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-green-600">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <Progress
                    value={(amount / totalIncome) * 100}
                    className="h-2 bg-green-100"
                  />
                  <div className="text-xs text-muted-foreground">
                    {((amount / totalIncome) * 100).toFixed(1)}% dari total
                    pemasukan
                  </div>
                </div>
              ))}
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
                  <span className="text-sm font-medium">Tingkat Tabungan</span>
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
                  <span className="text-sm font-medium">Rasio Pengeluaran</span>
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
                    {transactions.filter((t) => t.type === "expense").length}
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
  );
}
