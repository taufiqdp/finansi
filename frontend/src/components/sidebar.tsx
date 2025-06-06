import {
  CreditCard,
  DollarSign,
  Home,
  PieChart,
  Plus,
  Bot,
  ChevronRight,
  MessageSquare,
  History,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";

export default function Sidebar({
  children,
  header,
  description,
}: {
  children: React.ReactNode;
  header: string;
  description: string;
}) {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex w-64 flex-col border-r">
        <div className="p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Assistant
          </h2>
        </div>
        <Separator />
        <div className="flex-1 overflow-auto p-3">
          <div className="space-y-1">
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 hover:cursor-pointer"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/transactions">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 hover:cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                Transactions
              </Button>
            </Link>
            <Link href="/analytics">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 hover:cursor-pointer"
              >
                <PieChart className="h-4 w-4" />
                Analytics
              </Button>
            </Link>

            <Collapsible className="group/collapsible">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:cursor-pointer"
                >
                  <Bot className="h-4 w-4" />
                  <span>AI Assistant</span>
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 space-y-1 mt-1">
                  <Link href="/chat">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 hover:cursor-pointer text-sm"
                      size="sm"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Chat
                    </Button>
                  </Link>
                  <Link href="/chat/history">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 hover:cursor-pointer text-sm"
                      size="sm"
                    >
                      <History className="h-3 w-3" />
                      History Chat
                    </Button>
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* <Separator className="my-4" /> */}
        </div>
        <div className="p-4">
          <Link href="/chat/new">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 hover:cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full">
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold">{header}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}
