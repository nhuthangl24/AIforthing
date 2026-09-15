"use client";

import { Message } from "@/lib/store/chat-store";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, User, Loader2 } from "lucide-react";
import { useState } from "react";
import rehypeHighlight from "rehype-highlight";
import 'highlight.js/styles/github-dark.css';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex w-full gap-4 py-6 group">
      <div className="shrink-0 flex items-start justify-center">
        {isUser ? (
          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-md bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-orange-500" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2 flex-1 max-w-3xl min-w-0">
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((att, idx) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                key={idx} 
                src={att.data} 
                alt={att.name} 
                className="max-w-[200px] max-h-[200px] rounded-lg border object-cover" 
              />
            ))}
          </div>
        )}

        <div className="text-foreground relative min-h-[32px] flex flex-col justify-center">
          {message.thinking && !message.content ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Thinking...</span>
            </div>
          ) : isUser ? (
            <div className="whitespace-pre-wrap text-lg leading-relaxed">{message.content}</div>
          ) : (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  code({ inline, className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = inline || !match;
                    return isInline ? (
                      <code className="bg-muted-foreground/20 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <div className="relative group/code mt-4 mb-6 rounded-lg overflow-hidden border border-border/50">
                        <div className="flex justify-between items-center bg-zinc-900 text-zinc-400 px-4 py-2 text-xs border-b border-white/10">
                          <span className="font-medium lowercase">{match[1]}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
                            }}
                            className="hover:text-zinc-100 transition-colors flex items-center gap-1.5"
                          >
                            <Copy className="w-3 h-3" />
                            Copy code
                          </button>
                        </div>
                        <pre className="!mt-0 !mb-0 p-4 overflow-x-auto bg-[#0d1117]">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Action Row & Usage Data */}
          {!isUser && !message.thinking && message.content && (
            <div className="flex items-center gap-4 mt-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground -ml-2 transition-opacity"
                onClick={handleCopy}
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              
              {message.usage && (
                <div className="text-xs text-muted-foreground font-mono flex items-center gap-3 ml-auto transition-opacity">
                  <span title="Prompt tokens">In: {message.usage.prompt_tokens}</span>
                  <span title="Completion tokens">Out: {message.usage.completion_tokens}</span>
                  <span title="Total tokens" className="font-medium text-foreground/70">Total: {message.usage.total_tokens}</span>
                  {message.usage.estimated_cost !== undefined && message.usage.estimated_cost > 0 && (
                    <span title="Estimated cost" className="text-orange-500/80">
                      -{new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 4 }).format(message.usage.estimated_cost)} Cr
                    </span>
                  )}
                  {message.usage.estimated_cost !== undefined && message.usage.estimated_cost === 0 && (
                    <span title="Tokens deducted" className="text-green-500/80">
                      -{new Intl.NumberFormat('vi-VN').format(message.usage.total_tokens)} T
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
