import { Overview } from "@/components/overview";
import Sidebar from "@/components/sidebar";
import { getTransactionsByUserId } from "@/lib/actions";

export const dynamic = "force-dynamic";

// Type for component props
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
    // Fetch transactions for user ID 1
    const apiTransactions = await getTransactionsByUserId(1);

    // Transform API transactions to component format
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
      <Sidebar header="Financial Assistant" description="Manage your finances">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar header="Financial Assistant" description="Manage your finances">
      <Overview transactions={transactions} />
    </Sidebar>
  );
}
