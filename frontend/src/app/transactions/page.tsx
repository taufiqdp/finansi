"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/sidebar";
import {
  getAllTransactions,
  createTransaction,
  deleteTransaction,
  Transaction,
} from "@/lib/actions";
import AddTransaction from "@/components/add-transaction";

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: "" as "income" | "expense" | "",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.type ||
      !formData.amount ||
      !formData.category ||
      !formData.description
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTransaction({
        userId: 1,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
      });

      toast.success("Transaction added successfully!");

      // Reset form
      setFormData({
        type: "" as "income" | "expense" | "",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });

      setIsDialogOpen(false);
      loadTransactions();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      toast.success("Transaction deleted successfully!");
      loadTransactions();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "type" ? { category: "" } : {}),
    }));
  };

  return (
    <>
      <Sidebar
        header="Transactions"
        description="Manage your income and expenses"
      >
        <div className="space-y-6">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <p className="text-muted-foreground">
                Track all your financial activities
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                  <DialogDescription>
                    Enter the details of your transaction below.
                  </DialogDescription>
                </DialogHeader>

                <AddTransaction
                  setIsDialogOpen={setIsDialogOpen}
                  isSubmitting={isSubmitting}
                  handleSubmit={handleSubmit}
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                {transactions.length} transaction(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>

                  <p>Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add your first transaction to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "income"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                            {transaction.category}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-medium ${
                              transaction.type === "income"
                                ? "text-green-900"
                                : "text-rose-500"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-700 hover:cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Sidebar>
      <Toaster />
    </>
  );
}

// export default function TransactionsPage() {
//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <h1 className="text-2xl font-bold">Transactions Page</h1>
//       <p className="text-muted-foreground mt-2">
//         This page is under construction.
//       </p>
//     </div>
//   );
// }
