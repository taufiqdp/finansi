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
import {
  getSession,
  Event as Message,
  sendChatMessage,
  ChatRequest,
} from "@/lib/actions";
import SidebarLayout from "@/components/sidebar-layout";
import ReactMarkdown from "react-markdown";

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

  useEffect(() => {
    const fecthSession = async () => {
      try {
        const session = await getSession(chatId as string);
        if (session && session.length > 0) {
          console.log("Fetched session:", session);
          const filteredEvents = session.filter((event) => {
            return !event.content?.parts?.some(
              (part) => part.functionCall || part.functionResponse
            );
          });

          setMessages(filteredEvents);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fecthSession();
  }, [chatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: {
        parts: [
          {
            text: input,
          },
        ],
        role: "user",
      },
      timestamp: Date.now(),
      author: "user",
      invocationId: `invocation-${Date.now()}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const events = await sendChatMessage({
        sessionId: chatId as string,
        newMessage: userMessage.content as ChatRequest["newMessage"],
        streaming: false,
      });

      const filteredEvents = events.filter((event) => {
        return !event.content?.parts?.some(
          (part) => part.functionCall || part.functionResponse
        );
      });
      setMessages((prev) => [...prev, ...filteredEvents]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: {
          parts: [
            {
              text: "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.",
            },
          ],
          role: "model",
        },
        timestamp: Date.now(),
        author: "model",
        invocationId: `invocation-${Date.now()}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <SidebarLayout
      header="Asisten Keuangan"
      description="Tanyakan tentang transaksi, anggaran, dan tujuan keuangan Anda"
      breadcrumbs={[{ title: "Dashboard", href: "/" }, { title: "Chat" }]}
    >
      <div className="flex flex-col h-[calc(100vh-170px)] overflow-hidden">
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
            <div className="p-4">
              <div className="space-y-6 sm:max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.content?.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    {message.content?.role === "model" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        "rounded-lg p-4 max-w-[80%] break-words",
                        message.content?.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-4 space-y-1 mb-2">
                                {children}
                              </ol>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc ml-4 space-y-1 mb-2">
                                {children}
                              </ul>
                            ),
                            li: ({ children }) => (
                              <li className="leading-relaxed mb-2">
                                {children}
                              </li>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-bold mb-2">
                                {children}
                              </h3>
                            ),
                            code: ({ children }) => (
                              <code className="py-0.5 rounded text-xs my-2 bg-muted">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto mb-2">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {message.content?.parts
                            ?.map((part) => part.text)
                            .join("")}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {message.content?.role === "user" && (
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

        <div className="p-3 border-t bg-background flex-shrink-0">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-3xl mx-auto"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan tentang keuangan Anda..."
              className="min-h-[40px] max-h-24 resize-none"
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
