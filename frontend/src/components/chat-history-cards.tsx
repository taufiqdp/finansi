import {
  ArrowRight,
  Clock,
  MessageSquare,
  Trash2,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ChatSession } from "@/lib/actions";
import Link from "next/link";

export default function ChatHistoryCards({
  chatHistory,
}: {
  chatHistory: ChatSession[];
}) {
  const handleDeleteChat = (chatId: string) => {
    console.log("Menghapus chat:", chatId);
  };

  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) {
      return "Baru saja";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam yang lalu`;
    } else if (diffInHours < 48) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  }

  return (
    <div className=" mx-auto p-4 sm:p-6">
      {chatHistory.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-xl opacity-60"></div>
              <div className="relative bg-white rounded-full p-4 shadow-lg">
                <History className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Tidak ada riwayat chat
            </h3>
            <p className="text-gray-600 max-w-md mx-auto text-center leading-relaxed">
              Percakapan Anda akan muncul di sini setelah Anda mulai chat. Semua
              riwayat akan tersimpan untuk akses mudah di kemudian hari.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4">
            {chatHistory
              .sort((a, b) => b.lastUpdateTime - a.lastUpdateTime)
              .map((chat) => (
                <Card
                  key={chat?.id}
                  className="group border bg-white overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="px-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4">
                            <div className=" rounded-xl p-3 flex-shrink-0">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {chat.appName ? (
                                <h3 className="font-semibold text-gray-900 mb-1 leading-tight">
                                  {chat.appName}
                                </h3>
                              ) : (
                                <h3 className="font-medium text-gray-500 mb-1 italic">
                                  Tidak ada ringkasan tersedia
                                </h3>
                              )}

                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">
                                  {formatTimestamp(chat.lastUpdateTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/chat/${chat.id}`}>
                            <Button
                              className="text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 group/btn"
                              size="sm"
                            >
                              <span className="mr-2">Lanjutkan</span>
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleDeleteChat(chat.id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 "
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
