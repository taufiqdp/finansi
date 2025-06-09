"use client";

import { useState, useEffect } from "react";
import Loading from "@/components/loading";
import SidebarLayout from "@/components/sidebar-layout";
import ChatHistoryCards from "@/components/chat-history-cards";
import { ChatSession, getChatHistory } from "@/lib/actions";

export default function ChatHistoryPage() {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChatHistory() {
      try {
        setLoading(true);
        const history = await getChatHistory();
        setChatHistory(history);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChatHistory();
  }, []);

  return (
    <SidebarLayout
      header="Riwayat Chat"
      description={`${chatHistory.length} percakapan tersimpan`}
      breadcrumbs={[
        { title: "Dashboard", href: "/" },
        { title: "Chat", href: "/chat" },
        { title: "Riwayat Chat" },
      ]}
    >
      {loading ? (
        <Loading description="Memuat histori" />
      ) : (
        <ChatHistoryCards chatHistory={chatHistory} />
      )}
    </SidebarLayout>
  );
}
