"use client";

import type React from "react";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/lib/actions";
import SidebarLayout from "@/components/sidebar-layout";

type MessageRole = "user" | "model";
type MessagePart = {
  text?: string;
  functionCall?: unknown;
  functionResponse?: unknown;
};
type Message = {
  id: string;
  role: MessageRole;
  parts: MessagePart[];
  content: string;
  timestamp: number;
  loading?: boolean;
};

export default function FinancialChat() {
  const params = useParams();
  const chatId = params.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      parts: [{ text: input }],
      content: input,
      timestamp: Date.now(),
    };

    const loadingId = `assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: loadingId,
        role: "model",
        parts: [],
        content: "",
        timestamp: Date.now(),
        loading: true,
      },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const data = await sendChatMessage({
        user_id: "1",
        session_id: chatId,
        new_message: {
          parts: [{ text: input }],
          role: "user",
        },
        streaming: false,
      });

      let assistantMessage: Message = {
        id: loadingId,
        role: "model",
        parts: [],
        content: "",
        timestamp: Date.now(),
        loading: false,
      };

      const parts = Array.isArray(data)
        ? data.flatMap((d) => d.content?.parts || [])
        : data.content?.parts || [];

      for (const part of parts) {
        if (part.text) {
          assistantMessage = {
            ...assistantMessage,
            content: assistantMessage.content + part.text,
            parts: [...assistantMessage.parts, part],
          };
        } else {
          assistantMessage.parts.push(part);
        }
      }

      setMessages((prev) =>
        prev.map((msg) => (msg.id === loadingId ? assistantMessage : msg))
      );
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content:
                  "Maaf, terjadi kesalahan saat memproses permintaan Anda.",
                loading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarLayout
      header="Asisten Keuangan"
      description="Tanyakan tentang transaksi, anggaran, dan tujuan keuangan Anda"
      breadcrumbs={[{ title: "Dashboard", href: "/" }, { title: "Chat" }]}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
            <div className="p-4">
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "model" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        "rounded-lg p-4 max-w-[80%] break-words",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.1s]"></div>
                            <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                          {message.parts.some((part) => part.functionCall) && (
                            <span className="text-xs">
                              Mengambil informasi...
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-muted">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t bg-background flex-shrink-0">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-3xl mx-auto"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan tentang keuangan Anda..."
              className="min-h-[50px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Kirim</span>
            </Button>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
