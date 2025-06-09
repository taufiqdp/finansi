"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { deleteTransaction, TransactionResponse } from "@/lib/actions";
import { toast } from "sonner";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function TableTransaction({
  transactions,
  loadTransactions,
}: {
  transactions: TransactionResponse[];
  loadTransactions: () => Promise<void>;
}) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TransactionResponse | null;
    direction: "asc" | "desc";
  }>({ key: "date", direction: "desc" });
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

  const SortIcon = ({ column }: { column: keyof TransactionResponse }) => {
    if (sortConfig.key !== column) {
      return <div className="w-4 h-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const handleSort = (key: keyof TransactionResponse) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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

  return (
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
                  transaction.type === "income" ? "default" : "destructive"
                }
              >
                {transaction.type === "income" ? "pemasukan" : "pengeluaran"}
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
  );
}
