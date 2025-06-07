"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/sidebar";
import Loading from "@/components/loading";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const chatId = uuidv4();

    router.replace(`/chat/${chatId}`);
  }, [router]);

  return (
    <Sidebar
      header="Asisten Keuangan"
      description="Tanyakan tentang transaksi, anggaran, dan tujuan keuangan Anda"
    >
      <Loading description="Memuat..." />
    </Sidebar>
  );
}
