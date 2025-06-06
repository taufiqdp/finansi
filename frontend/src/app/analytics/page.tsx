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
import { getAllTransactions, Transaction } from "@/lib/actions";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function AnalyticsPage() {
  // Fetch real transactions from API
  const transactions: Transaction[] = await getAllTransactions();

  // Calculate summary data from real transactions
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  // Group expenses by category
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Group income by category
  const incomeByCategory = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <Sidebar
      header="Financial Analytics"
      description="Track your financial health"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                -5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
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
                {netBalance >= 0 ? "Positive" : "Negative"} cash flow
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Savings Rate
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
              Overview
            </TabsTrigger>
            <TabsTrigger value="expenses" className="cursor-pointer">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="income" className="cursor-pointer">
              Income
            </TabsTrigger>
            <TabsTrigger value="trends" className="cursor-pointer">
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>Monthly comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Income</span>
                      <span className="text-sm text-green-600">
                        {formatCurrency(totalIncome)}
                      </span>
                    </div>
                    <Progress value={100} className="h-2 bg-green-100" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Expenses</span>
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
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest financial activities</CardDescription>
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
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Spending by category</CardDescription>
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
                          {((amount / totalExpenses) * 100).toFixed(1)}% of
                          total expenses
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
                <CardTitle>Income Sources</CardTitle>
                <CardDescription>Revenue by category</CardDescription>
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
                          {((amount / totalIncome) * 100).toFixed(1)}% of total
                          income
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
                <CardTitle>Financial Health</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Savings Rate</span>
                      <span className="text-sm font-bold">
                        {savingsRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={savingsRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {savingsRate >= 20
                        ? "Excellent"
                        : savingsRate >= 10
                        ? "Good"
                        : "Needs improvement"}{" "}
                      savings rate
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Expense Ratio</span>
                      <span className="text-sm font-bold">
                        {((totalExpenses / totalIncome) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={(totalExpenses / totalIncome) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentage of income spent on expenses
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {transactions.filter((t) => t.type === "income").length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Income Transactions
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
                        Expense Transactions
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
