"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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

import { Toaster } from "@/components/ui/sonner";
import {
  createTransaction,
  getTransactions,
  Transaction,
  TransactionResponse,
} from "@/lib/actions";
import AddTransaction from "@/components/add-transaction";
import Loading from "@/components/loading";
import SidebarLayout from "@/components/sidebar-layout";
import TableTransaction from "@/components/table-transaction";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Transaction>({
    type: "" as "income" | "expense" | "",
    amount: 0,
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // Default to today
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
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
      toast.error("Harap isi semua kolom");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTransaction({
        type: formData.type,
        amount: formData.amount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
      });

      toast.success("Transaksi berhasil ditambahkan!");

      setFormData({
        type: "" as "income" | "expense" | "",
        amount: 0,
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
              <h2 className="text-xl font-bold">Riwayat Transaksi</h2>
              <p className="text-muted-foreground text-sm">
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
                <TableTransaction
                  transactions={transactions}
                  loadTransactions={loadTransactions}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
      <Toaster />
    </>
  );
}
