"use client";

import { useChatStore } from "@/lib/store/chat-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Trash2, X, PanelLeftClose, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Sidebar() {
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversation, 
    deleteConversation, 
    createConversation,
    sidebarOpen,
    setSidebarOpen
  } = useChatStore();

  const sortedConversations = Object.values(conversations).sort((a, b) => b.updatedAt - a.updatedAt);

  if (!sidebarOpen) {
    return null; // Handle hidden state (for desktop overlay/drawer logic)
  }

  return (
    <div className="flex flex-col h-full w-64 bg-muted/30 border-r transition-all duration-300">
      <div className="p-4 flex items-center justify-between">
        <Button onClick={() => createConversation()} className="flex-1 justify-start gap-2 mr-2" variant="default">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden">
          <X className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="hidden md:flex">
          <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-2">
          {sortedConversations.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4">No conversations yet.</p>
          ) : (
            sortedConversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors",
                  currentConversationId === conv.id ? "bg-muted font-medium" : ""
                )}
                onClick={() => setCurrentConversation(conv.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">{conv.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer Navigation */}
      <div className="p-4 border-t border-white/5 mt-auto">
        <Link href="/models" className="w-full">
          <Button variant="outline" className="w-full justify-start gap-2 bg-[#1a1a1a] hover:bg-[#222] border-white/10 text-muted-foreground hover:text-white transition-colors">
            <Server className="w-4 h-4 text-orange-500" />
            Trạng thái Models
          </Button>
        </Link>
      </div>
    </div>
  );
}
