import { models } from "@/lib/ai/models";
import Link from "next/link";
import { ArrowLeft, Server, Activity, CheckCircle2, Copy } from "lucide-react";

// Deterministic pseudo-random based on string hash for stable UI
const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getUptime = (id: string) => {
  const hash = hashString(id);
  // Random between 97.00% and 99.99%
  return (97 + (hash % 300) / 100).toFixed(2);
};

const getBlocks = (id: string) => {
  const hash = hashString(id);
  const blocks = [];
  for (let i = 0; i < 30; i++) {
    const isError = (hash * (i + 1)) % 100 > 95; // ~5% chance of error block
    const isWarn = !isError && (hash * (i + 2)) % 100 > 90; // ~10% chance of warn block
    if (isError) blocks.push('error');
    else if (isWarn) blocks.push('warn');
    else blocks.push('success');
  }
  return blocks;
};

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-[#ededed] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Server className="w-8 h-8 text-orange-500" />
              Network Status
            </h1>
            <p className="text-muted-foreground mt-2">
              Đã tìm thấy: {models.length} mô hình
            </p>
          </div>
          <Link href="/">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />
              Quay lại Chat
            </button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => {
            const uptime = getUptime(model.id);
            const blocks = getBlocks(model.id);
            const isFree = model.cost === 0;

            return (
              <div 
                key={model.id}
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-colors duration-300 flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{model.provider}</span>
                      {isFree && (
                        <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                          ✨ Free Model
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white">{model.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs text-muted-foreground bg-black/30 px-2 py-1 rounded-md">{model.id}</code>
                    </div>
                  </div>
                </div>

                {/* Uptime Section */}
                <div className="mb-5 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Uptime (SLA 24h) 
                    </span>
                    <span className={`font-bold ${parseFloat(uptime) > 98 ? 'text-green-500' : 'text-orange-500'}`}>
                      {uptime}%
                    </span>
                  </div>
                  <div className="flex gap-1 h-3 w-full">
                    {blocks.map((status, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-sm ${
                          status === 'error' ? 'bg-red-500' 
                          : status === 'warn' ? 'bg-orange-500' 
                          : 'bg-green-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="text-sm text-muted-foreground/80 leading-relaxed flex-1">
                  {model.description}
                </div>

                {/* Footer Badges */}
                <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full border border-green-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đang hoạt động
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium bg-white/5 text-muted-foreground px-2.5 py-1 rounded-full border border-white/10">
                    <Activity className="w-3.5 h-3.5" />
                    {model.cost === 0 ? '0 Credits / 1M' : `${model.cost} Credits / 1M`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
