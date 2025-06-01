"use client";

import { Transaction } from "@/db/schema";
import { useState } from "react";
import { addTransaction as addTransactionAction } from "@/app/actions";
import { AddTransaction } from "@/components/add-transaction";

export default function AddTransactionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "createdAt" | "userId">
  ) => {
    try {
      setIsLoading(true);
      await addTransactionAction(transaction, 1); // Replace 1 with actual user ID logic
      console.log("Transaction added successfully");
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ) : (
    <AddTransaction onAddTransaction={addTransaction}></AddTransaction>
  );
}
