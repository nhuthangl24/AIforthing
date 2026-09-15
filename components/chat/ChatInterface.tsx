"use client";

import { useChatStore, Attachment } from "@/lib/store/chat-store";
import { Sidebar } from "./Sidebar";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { ModelSelector } from "./ModelSelector";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getModelById } from "@/lib/ai/models";

export function ChatInterface() {
  const { 
    conversations, 
    currentConversationId, 
    sidebarOpen, 
    setSidebarOpen,
    addMessage,
    updateMessage,
    createConversation,
    deleteConversation,
    globalModelId,
    credits,
  } = useChatStore();

  const [isStreaming, setIsStreaming] = useState(false);
  const [globalCredits, setGlobalCredits] = useState<number | null>(null);
  const [globalFreeTokens, setGlobalFreeTokens] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentConversation = currentConversationId ? conversations[currentConversationId] : null;
  const messages = currentConversation?.messages || [];
  const modelId = currentConversation ? currentConversation.modelId : globalModelId;
  const activeModel = getModelById(modelId);

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/credits');
      if (res.ok) {
        const data = await res.json();
        setGlobalCredits(data.credits);
        if (data.freeTokens !== undefined) setGlobalFreeTokens(data.freeTokens);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };
  useEffect(() => {
    fetchCredits();
    const interval = setInterval(fetchCredits, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (content: string, attachments: Attachment[]) => {
    // Hidden admin command to set credits manually
    if (content.trim().toLowerCase().startsWith('/setcredit ')) {
      const amountStr = content.trim().split(' ')[1];
      if (amountStr) {
        // Handle both comma and dot decimals
        const amount = parseFloat(amountStr.replace(/\./g, '').replace(/,/g, '.'));
        const fallbackAmount = parseFloat(amountStr.replace(/,/g, ''));
        const finalAmount = !isNaN(amount) && amountStr.includes(',') ? amount : (!isNaN(fallbackAmount) ? fallbackAmount : NaN);
        
        if (!isNaN(finalAmount)) {
          // Call API to set credits globally
          await fetch('/api/credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'set', amount: finalAmount })
          });
          fetchCredits();
          return;
        }
      }
    }

    let convId = currentConversationId;
    if (!convId) {
      convId = createConversation(globalModelId);
    }
    
    // Check vision support if attachments are present
    if (attachments.length > 0) {
      if (!activeModel.vision) {
        alert(`The selected model (${activeModel.name}) does not support image analysis. Please choose a vision-capable model.`);
        return;
      }
    }

    addMessage(convId, { role: "user", content, attachments });

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();
    
    let assistantMessageId = "";

    try {
      // Get updated messages from state
      // Note: Zustand update is sync, but we might not have the freshest state here, 
      // so we construct the messages array manually for the API call
      const apiMessages = [...messages, { role: "user", content, attachments }];

      // Add a placeholder message for the assistant immediately to show thinking state
      addMessage(convId, { role: "assistant", content: "", thinking: true });
      assistantMessageId = useChatStore.getState().conversations[convId].messages.slice(-1)[0].id;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: modelId,
          messages: apiMessages,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        updateMessage(convId, assistantMessageId, { 
          content: `**HHTECH API Error (${res.status}):**\n\`\`\`json\n${errText}\n\`\`\``,
          thinking: false
        });
        setIsStreaming(false);
        return;
      }

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let finalUsage: any = undefined;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // OpenAI SSE format usually has "data: {...}"
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                const delta = data.choices[0]?.delta?.content || "";
                if (delta) {
                  assistantContent += delta;
                  updateMessage(convId, assistantMessageId, { content: assistantContent });
                }
                if (data.usage) {
                  finalUsage = data.usage;
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            } else if (line.trim() && !line.startsWith(':')) {
              // Handle non-SSE fallback if the API sends plain text chunks or another format
              try {
                const data = JSON.parse(line);
                if (data.choices && data.choices[0]?.delta?.content) {
                  assistantContent += data.choices[0].delta.content;
                  updateMessage(convId, assistantMessageId, { content: assistantContent });
                }
                if (data.usage) {
                  finalUsage = data.usage;
                }
              } catch (e) {
                // Ignore
              }
            }
          }
        }
        
        if (!finalUsage) {
          // Fallback: Estimate usage if API didn't provide it in stream
          const promptContent = apiMessages.map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content)).join(" ");
          const promptTokens = Math.ceil(promptContent.length / 4);
          const completionTokens = Math.ceil(assistantContent.length / 4);
          finalUsage = {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: promptTokens + completionTokens
          };
        }

        if (finalUsage && finalUsage.total_tokens) {
          const cost = (finalUsage.total_tokens / 1_000_000) * activeModel.cost;
          finalUsage.estimated_cost = cost;
          
          if (cost > 0) {
            // Deduct globally
            fetch('/api/credits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'deduct', amount: cost })
            }).then(() => fetchCredits()).catch(console.error);
          } else {
            // Free model: deduct tokens
            fetch('/api/credits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'deduct_tokens', tokens: finalUsage.total_tokens })
            }).then(() => fetchCredits()).catch(console.error);
          }
        }
        
        // Final update to disable thinking and save usage
        updateMessage(convId, assistantMessageId, { 
          thinking: false,
          ...(finalUsage ? { usage: finalUsage } : {})
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted');
        updateMessage(convId, assistantMessageId, { thinking: false });
      } else {
        console.error("Chat error:", error);
        updateMessage(convId, assistantMessageId, { 
          content: "**Error:** Network issue or request failed.",
          thinking: false
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 shrink-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <PanelLeftOpen className="w-5 h-5 text-muted-foreground" />
              </Button>
            )}
            <ModelSelector conversationId={currentConversationId} />
            <div className="ml-2 px-3 py-1 bg-[#2a2a2a] rounded-full text-sm font-medium border border-white/5 hidden md:flex items-center gap-2">
              <span className="text-foreground/90">{new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(globalCredits !== null ? globalCredits : credits)} Credits</span>
              {globalFreeTokens !== null && (
                <>
                  <span className="text-white/20">|</span>
                  <span className="text-green-500/90">{new Intl.NumberFormat('vi-VN').format(globalFreeTokens)} Tokens</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="md:hidden px-2 py-1 bg-[#2a2a2a] rounded-full text-xs font-medium border border-white/5 flex items-center gap-1">
              <span>{new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(globalCredits !== null ? globalCredits : credits)} Cr</span>
              {globalFreeTokens !== null && (
                <>
                  <span className="text-white/20">|</span>
                  <span className="text-green-500/90">{new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(globalFreeTokens)} T</span>
                </>
              )}
            </div>
            {currentConversationId && (
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => deleteConversation(currentConversationId)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <MessageList messages={messages} isStreaming={isStreaming} />
        
        {/* Input Area */}
        <div className="shrink-0">
          <Composer onSend={handleSend} isStreaming={isStreaming} onStop={handleStop} />
        </div>
      </div>
    </div>
  );
}
