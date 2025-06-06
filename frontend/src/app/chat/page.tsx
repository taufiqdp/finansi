"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/sidebar";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const chatId = uuidv4();

    router.replace(`/chat/${chatId}`);
  }, [router]);

  return (
    <Sidebar
      header="Financial Assistant"
      description="Ask about your transactions, budgets, and financial goals"
    >
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating new chat session...</p>
        </div>
      </div>
    </Sidebar>
  );
}
