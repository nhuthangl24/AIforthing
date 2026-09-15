"use client";

import { Message } from "@/lib/store/chat-store";
import { MessageBubble } from "./MessageBubble";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages, autoScroll, isStreaming]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Check if we are near the bottom (within 150px)
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 150;
    
    setShowScrollButton(!isAtBottom);
    setAutoScroll(isAtBottom);
  };

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      setAutoScroll(true);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-semibold mb-2">Ask anything</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Upload images, ask coding questions, or explore new concepts.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
          {["Explain a technical concept", "Help me debug code", "Analyze this screenshot", "Write a Next.js component"].map((suggestion, idx) => (
            <div key={idx} className="p-4 border rounded-xl bg-card hover:bg-muted/50 cursor-pointer transition-colors text-sm font-medium">
              {suggestion}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 h-full overflow-hidden">
      <ScrollArea 
        ref={scrollRef} 
        className="h-full w-full pr-4" 
        onScrollCapture={handleScroll}
      >
        <div className="flex flex-col gap-4 pb-20 pt-4 max-w-4xl mx-auto px-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={bottomRef} className="h-px w-full" />
        </div>
      </ScrollArea>
      
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-6 right-6 rounded-full shadow-md z-10 animate-in fade-in zoom-in"
          onClick={scrollToBottom}
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
