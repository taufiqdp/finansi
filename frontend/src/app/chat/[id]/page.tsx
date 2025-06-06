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
import Sidebar from "@/components/sidebar";

type MessageRole = "user" | "assistant" | "system";
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

  console.log("Chat ID:", chatId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
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

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      parts: [{ text: input }],
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Add loading message for assistant
    const loadingId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "assistant",
        parts: [],
        content: "",
        timestamp: Date.now(),
        loading: true,
      },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          user_id: "1",
          session_id: chatId,
          new_message: {
            parts: [{ text: input }],
            role: "user",
          },
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get reader from response");

      let assistantMessage: Message = {
        id: loadingId,
        role: "assistant",
        parts: [],
        content: "",
        timestamp: Date.now(),
        loading: false,
      };

      // Process the stream
      const decoder = new TextDecoder();
      let buffer = "";
      let hasReceivedContent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split by lines and process each complete line
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

          try {
            const jsonStr = trimmedLine.slice(6); // Remove "data: " prefix
            const data = JSON.parse(jsonStr);

            if (data.content && data.content.parts) {
              for (const part of data.content.parts) {
                if (part.functionCall) {
                  // Function call started
                  assistantMessage = {
                    ...assistantMessage,
                    parts: [...assistantMessage.parts, part],
                    loading: true,
                  };
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === loadingId ? assistantMessage : msg
                    )
                  );
                } else if (part.functionResponse) {
                  // Function call completed
                  assistantMessage = {
                    ...assistantMessage,
                    parts: [...assistantMessage.parts, part],
                    loading: false,
                  };
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === loadingId ? assistantMessage : msg
                    )
                  );
                } else if (part.text) {
                  // Text response - replace content for complete responses
                  hasReceivedContent = true;
                  assistantMessage = {
                    ...assistantMessage,
                    parts: [...assistantMessage.parts],
                    content: part.text, // Replace instead of append
                    loading: data.partial || false,
                  };
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === loadingId ? assistantMessage : msg
                    )
                  );
                }
              }
            }
          } catch (error) {
            console.error("Failed to parse JSON line:", trimmedLine, error);
          }
        }
      }

      // Only process remaining buffer if no streaming content was received
      if (
        !hasReceivedContent &&
        buffer.trim() &&
        buffer.trim().startsWith("data: ")
      ) {
        try {
          const jsonStr = buffer.trim().slice(6);
          const data = JSON.parse(jsonStr);
          if (data.content && data.content.parts) {
            for (const part of data.content.parts) {
              if (part.text) {
                assistantMessage = {
                  ...assistantMessage,
                  content: part.text, // Replace instead of append
                  loading: false,
                };
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === loadingId ? assistantMessage : msg
                  )
                );
              }
            }
          }
        } catch (error) {
          console.error("Failed to parse remaining buffer:", error);
        }
      }

      // Ensure final message is not loading
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId ? { ...msg, loading: false } : msg
        )
      );
    } catch (error) {
      console.error("Error:", error);
      // Update the loading message to show error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: "Sorry, there was an error processing your request.",
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
    <Sidebar
      header="Financial Assistant"
      description="Ask about your transactions, budgets, and financial goals"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Messages - Fixed height container with internal scrolling */}
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
                    {message.role === "assistant" && (
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
                              Running database query...
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">
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

        {/* Input - Fixed at bottom */}
        <div className="p-4 border-t bg-background flex-shrink-0">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-3xl mx-auto"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
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
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </Sidebar>
  );
}
