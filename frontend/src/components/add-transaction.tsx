import { DollarSign, Calendar, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const incomeCategories = [
  "Gaji",
  "Freelance",
  "Investasi",
  "Bisnis",
  "Lainnya",
];
const expenseCategories = [
  "Makanan",
  "Transportasi",
  "Sewa",
  "Tagihan",
  "Hiburan",
  "Belanja",
  "Kesehatan",
  "Pendidikan",
  "Lainnya",
];

interface AddTransactionProps {
  setIsDialogOpen: (open: boolean) => void;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  formData: {
    type: "income" | "expense" | "";
    amount: string;
    category: string;
    description: string;
    date: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export default function AddTransaction({
  setIsDialogOpen,
  isSubmitting,
  handleSubmit,
  formData,
  handleInputChange,
}: AddTransactionProps) {
  const getAvailableCategories = () => {
    return formData.type === "income" ? incomeCategories : expenseCategories;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Jenis Transaksi</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleInputChange("type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Jumlah</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            className="pl-10"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleInputChange("category", value)}
          disabled={!formData.type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableCategories().map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="description"
            placeholder="Masukkan deskripsi transaksi"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="pl-10"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Tanggal</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDialogOpen(false)}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting ? "Menambahkan..." : "Tambah Transaksi"}
        </Button>
      </div>
    </form>
  );
}
