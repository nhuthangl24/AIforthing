"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Square, X } from "lucide-react";
import { Attachment } from "@/lib/store/chat-store";
import { cn } from "@/lib/utils";

interface ComposerProps {
  onSend: (content: string, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export function Composer({ onSend, isStreaming, onStop }: ComposerProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if ((!content.trim() && attachments.length === 0) || isStreaming) return;
    onSend(content.trim(), attachments);
    setContent("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(Array.from(e.target.files));
    }
    // Reset file input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFiles = async (files: File[]) => {
    // Filter out non-images or too large files
    const validFiles = files.filter(f => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type);
      const isValidSize = f.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidType) alert(`${f.name} is not a supported image format.`);
      if (!isValidSize) alert(`${f.name} is too large (max 5MB).`);
      return isValidType && isValidSize;
    });

    const currentCount = attachments.length;
    const remainingSlots = 4 - currentCount;
    const toProcess = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      alert("You can only upload up to 4 images per message.");
    }

    const newAttachments: Attachment[] = [];
    for (const file of toProcess) {
      try {
        const data = await fileToBase64(file);
        newAttachments.push({
          name: file.name,
          contentType: file.type,
          data
        });
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (e.clipboardData.items) {
      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].type.indexOf("image") !== -1) {
          const file = e.clipboardData.items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault(); // Prevent pasting image as base64 string into textarea
        await processFiles(files);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div 
      className="p-4 w-full flex flex-col items-center pb-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="w-full max-w-3xl relative">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative shrink-0 group/att">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={att.data} 
                  alt={att.name} 
                  className="w-16 h-16 object-cover rounded-xl border border-white/10" 
                />
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-2 -right-2 bg-zinc-700 text-white rounded-full p-1 opacity-0 group-hover/att:opacity-100 transition-opacity hover:bg-zinc-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex flex-col bg-[#2a2a2a] border border-white/10 rounded-2xl p-1 shadow-lg transition-all focus-within:ring-1 focus-within:ring-white/20">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Write a message..."
            className="min-h-[52px] max-h-[40vh] bg-transparent border-0 focus-visible:ring-0 px-3 py-3 resize-none text-[15px] placeholder:text-zinc-500"
            disabled={isStreaming}
          />
          
          <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp, image/gif" 
              multiple 
              onChange={handleFileChange}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= 4 || isStreaming}
              title="Attach image"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {isStreaming ? (
              <Button 
                variant="default" 
                size="icon" 
                className="shrink-0 rounded-lg h-8 w-8 bg-zinc-100 text-zinc-900 hover:bg-white"
                onClick={onStop}
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="icon" 
                className={cn(
                  "shrink-0 rounded-lg h-8 w-8 transition-colors",
                  !content.trim() && attachments.length === 0 ? "bg-zinc-700 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"
                )}
                onClick={handleSend}
                disabled={!content.trim() && attachments.length === 0}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            )}
          </div>
        </div>
        <div className="text-center mt-3 text-xs text-zinc-500">
          AI models can make mistakes. Please double-check responses.
        </div>
      </div>
    </div>
  );
}
