"use client";

import { useChatStore } from "@/lib/store/chat-store";
import { models } from "@/lib/ai/models";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Image as ImageIcon, Type, Sparkles } from "lucide-react";

interface ModelSelectorProps {
  conversationId?: string | null;
}

export function ModelSelector({ conversationId }: ModelSelectorProps) {
  const { conversations, globalModelId, setGlobalModelId, updateConversationModel } = useChatStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-[250px] h-10 bg-muted animate-pulse rounded-md"></div>;

  const currentModelId = conversationId
    ? conversations[conversationId]?.modelId || globalModelId
    : globalModelId;

  const handleValueChange = (val: string | null) => {
    if (!val) return;
    if (conversationId) {
      updateConversationModel(conversationId, val);
    } else {
      setGlobalModelId(val);
    }
  };

  // Sort models by cost
  const sortedModels = [...models].sort((a, b) => a.cost - b.cost);
  const freeModels = sortedModels.filter(m => m.cost === 0);
  const visionModels = sortedModels.filter(m => m.vision && m.cost > 0);
  const textModels = sortedModels.filter(m => !m.vision && m.cost > 0);

  return (
    <Select value={currentModelId} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[250px] bg-background">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {freeModels.length > 0 && (
          <SelectGroup>
            <SelectLabel className="flex items-center gap-2 text-green-500 font-semibold">
              <Sparkles className="w-4 h-4" />
              Miễn phí (Free Models)
            </SelectLabel>
            {freeModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex flex-col items-start gap-1">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground flex gap-2">
                    <span>{model.provider}</span>
                    <span>•</span>
                    <span className="text-green-500/80">0 credits</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        <SelectGroup>
          <SelectLabel className="flex items-center gap-2 text-orange-500/90 font-semibold">
            <ImageIcon className="w-4 h-4" />
            Hỗ trợ hình ảnh (Vision)
          </SelectLabel>
          {visionModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col items-start gap-1">
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-muted-foreground flex gap-2">
                  <span>{model.provider}</span>
                  <span>•</span>
                  <span>{model.cost} credits/1M</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
        
        <SelectGroup>
          <SelectLabel className="flex items-center gap-2 text-zinc-400 font-semibold mt-2">
            <Type className="w-4 h-4" />
            Chỉ văn bản (Text Only)
          </SelectLabel>
          {textModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col items-start gap-1">
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-muted-foreground flex gap-2">
                  <span>{model.provider}</span>
                  <span>•</span>
                  <span>{model.cost} credits/1M</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
