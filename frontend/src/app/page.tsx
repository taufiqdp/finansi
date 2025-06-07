import { Overview } from "@/components/overview";
import SidebarLayout from "@/components/sidebar-layout";
import { getTransactionsByUserId } from "@/lib/actions";

export const dynamic = "force-dynamic";

type ComponentTransaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

export default async function Dashboard() {
  let transactions: ComponentTransaction[] = [];
  let error: string | null = null;

  try {
    const apiTransactions = await getTransactionsByUserId(1);

    transactions = apiTransactions.map((transaction) => ({
      id: transaction.id.toString(),
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split("T")[0],
    }));
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    error = err instanceof Error ? err.message : "Failed to load transactions";
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
