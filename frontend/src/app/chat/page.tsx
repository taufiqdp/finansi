"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Loading from "@/components/loading";
import SidebarLayout from "@/components/sidebar-layout";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const chatId = uuidv4();

    router.replace(`/chat/${chatId}`);
  }, [router]);

  return (
    <SidebarLayout
      header="Asisten Keuangan"
      description="Tanyakan tentang transaksi, anggaran, dan tujuan keuangan Anda"
      breadcrumbs={[{ title: "Dashboard", href: "/" }, { title: "Chat" }]}
    >
      <Loading description="Memuat..." />
    </SidebarLayout>
  );
}
