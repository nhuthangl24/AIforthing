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

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 md:relative md:z-0 flex flex-col h-full w-[280px] md:w-[260px] bg-[#171717] md:bg-background border-r border-white/5 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="font-serif text-lg font-semibold tracking-tight text-foreground/90 ml-2">Claude</div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground hover:bg-white/5 rounded-md h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="hidden md:flex text-muted-foreground hover:bg-white/5 rounded-md h-8 w-8">
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          {/* Main Navigation */}
          <div className="space-y-0.5 mt-2">
            <Button onClick={() => createConversation()} variant="ghost" className="w-full justify-start gap-3 px-3 py-2 h-9 text-[13px] font-medium text-foreground/80 hover:bg-white/5 hover:text-foreground">
              <Plus className="w-4 h-4" />
              New chat
            </Button>
          </div>

          {/* Recents Section */}
          <div className="mt-6 mb-1 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/50 uppercase">
            Recents
          </div>
          <div className="space-y-0.5 pb-4">
            {sortedConversations.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">No conversations yet.</p>
            ) : (
              sortedConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-start justify-between px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/5 transition-colors text-[13px]",
                    currentConversationId === conv.id ? "bg-white/10 font-medium text-foreground" : "text-foreground/70 hover:text-foreground font-normal"
                  )}
                  onClick={() => {
                    setCurrentConversation(conv.id);
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <span className="truncate pr-2 leading-relaxed">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5 -mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* Footer Navigation */}
        <div className="p-3 border-t border-white/5 mt-auto">
          <Link href="/models" className="w-full mb-2 block">
            <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-[13px] font-medium text-foreground/70 hover:bg-white/5 hover:text-foreground rounded-md">
              <Server className="w-4 h-4 text-orange-500/80" />
              Models Status
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
