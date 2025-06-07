"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Tag, ChevronUp, ChevronDown } from "lucide-react";
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
import {
  createTransaction,
  deleteTransaction,
  getTransactionsByUserId,
  Transaction,
} from "@/lib/actions";
import AddTransaction from "@/components/add-transaction";
import Loading from "@/components/loading";
import SidebarLayout from "@/components/sidebar-layout";

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
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction | null;
    direction: "asc" | "desc";
  }>({ key: "date", direction: "desc" });

  const [formData, setFormData] = useState({
    type: "" as "income" | "expense" | "",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactionsByUserId(1);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Transaction) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedTransactions = () => {
    if (!sortConfig.key) return transactions;

    return [...transactions].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (sortConfig.key === "date") {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (sortConfig.key === "amount") {
        const numA = Number(aValue);
        const numB = Number(bValue);
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      }

      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();

      if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
      if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ column }: { column: keyof Transaction }) => {
    if (sortConfig.key !== column) {
      return <div className="w-4 h-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.type ||
      !formData.amount ||
      !formData.category ||
      !formData.description
    ) {
      toast.error("Harap isi semua kolom");
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

      toast.success("Transaksi berhasil ditambahkan!");

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
      toast.error("Gagal menambahkan transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      toast.success("Transaksi berhasil dihapus!");
      loadTransactions();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      toast.error("Gagal menghapus transaksi");
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
      <SidebarLayout
        breadcrumbs={[
          { title: "Dashboard", href: "/" },
          { title: "Transaksi" },
        ]}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Riwayat Transaksi</h2>
              <p className="text-muted-foreground">
                Lacak semua aktivitas keuangan Anda
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Transaksi
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tambah Transaksi Baru</DialogTitle>
                  <DialogDescription>
                    Masukkan detail transaksi Anda di bawah ini.
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

          <Card>
            <CardHeader>
              <CardTitle>Semua Transaksi</CardTitle>
              <CardDescription>
                {transactions.length} transaksi ditemukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loading description="Memuat transaksi..." />
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Tidak ada transaksi ditemukan
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tambahkan transaksi pertama Anda untuk memulai
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Tanggal</span>
                          <SortIcon column="date" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Jenis</span>
                          <SortIcon column="type" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("category")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Kategori</span>
                          <SortIcon column="category" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("description")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Deskripsi</span>
                          <SortIcon column="description" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-right cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span>Jumlah</span>
                          <SortIcon column="amount" />
                        </div>
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSortedTransactions().map((transaction) => (
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
                            {transaction.type === "income"
                              ? "pemasukan"
                              : "pengeluaran"}
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
      </SidebarLayout>
      <Toaster />
    </>
  );
}
