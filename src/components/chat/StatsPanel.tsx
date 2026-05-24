/**
 * Post-generation stats: subtle inline trigger → full-screen modal with blurred backdrop.
 */
import {
  Zap,
  Clock,
  Brain,
  MessageSquare,
  BarChart3,
  X,
} from "lucide-react";
import type { GenerationStats } from "../../types";

/* ── Donut chart ── */
function ContextRing({ used, total, size = 96 }: { used: number; total: number; size?: number }) {
  const pct = Math.min((used / total) * 100, 100);
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct > 80 ? "text-red-400" : pct > 50 ? "text-orange-400" : "text-cyan-400";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-white/[0.06]" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className={`${color} transition-all duration-700`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-white">{Math.round(pct)}%</span>
        <span className="text-[9px] text-gray-500">context</span>
      </div>
    </div>
  );
}

/* ── Big stat card ── */
function StatCard({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent: string }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}

/* ── Detail row ── */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] font-medium text-gray-300">{value}</span>
    </div>
  );
}

/* ── Controlled stats modal ── */
interface StatsModalProps {
  stats: GenerationStats;
  open: boolean;
  onClose: () => void;
  modelName?: string;
  modelId?: string;
  parameterCount?: string;
  quantization?: string;
  contextWindow?: number;
  vramRequired?: number;
}

export function StatsModal({
  stats,
  open,
  onClose,
  modelName,
  modelId,
  parameterCount,
  quantization,
  contextWindow,
  vramRequired,
}: StatsModalProps) {
  if (!open) return null;

  const contextPct = Math.min((stats.contextUsed / stats.contextTotal) * 100, 100);

  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl bg-[#0a0a14]/95 border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0a0a14]/90 backdrop-blur-md border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Generation Stats</h2>
                  {modelName && (
                    <p className="text-[11px] text-gray-500 mt-0.5">{modelName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hero — speed + context ring */}
            <div className="px-6 py-6 flex flex-col sm:flex-row items-center gap-6 border-b border-white/[0.06]">
              <ContextRing used={stats.contextUsed} total={stats.contextTotal} size={100} />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-3xl font-bold text-white">{stats.tokensPerSecond.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">tokens/sec</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Generated {stats.tokensGenerated} tokens in {(stats.generationTimeMs / 1000).toFixed(1)}s
                </p>
                <div className="mt-3 w-full">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>Context usage</span>
                    <span>{stats.contextUsed.toLocaleString()} / {stats.contextTotal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${contextPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stat cards grid */}
            <div className="px-6 py-5">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-3">Performance</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={<Zap className="w-4 h-4 text-yellow-400" />}
                  value={`${stats.tokensPerSecond.toFixed(1)}`}
                  label="Tokens/sec"
                  accent="bg-yellow-500/10"
                />
                <StatCard
                  icon={<Clock className="w-4 h-4 text-green-400" />}
                  value={`${(stats.generationTimeMs / 1000).toFixed(2)}s`}
                  label="Gen time"
                  accent="bg-green-500/10"
                />
                <StatCard
                  icon={<MessageSquare className="w-4 h-4 text-purple-400" />}
                  value={String(stats.tokensGenerated)}
                  label="Tokens out"
                  accent="bg-purple-500/10"
                />
                <StatCard
                  icon={<Brain className="w-4 h-4 text-cyan-400" />}
                  value={String(stats.promptTokens)}
                  label="Prompt tokens"
                  accent="bg-cyan-500/10"
                />
              </div>
            </div>

            {/* Detailed breakdown */}
            <div className="px-6 pb-5">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2">Breakdown</p>
                <DetailRow label="Total tokens" value={String(stats.totalTokens)} />
                <DetailRow label="Prompt tokens" value={String(stats.promptTokens)} />
                <DetailRow label="Completion tokens" value={String(stats.tokensGenerated)} />
                <DetailRow label="Generation time" value={`${stats.generationTimeMs.toFixed(0)} ms`} />
                <DetailRow label="Context window" value={`${stats.contextUsed.toLocaleString()} / ${stats.contextTotal.toLocaleString()}`} />
              </div>
            </div>

            {/* Model info */}
            {(modelName || modelId) && (
              <div className="px-6 pb-6">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-2">Model</p>
                  {modelName && <DetailRow label="Name" value={modelName} />}
                  {parameterCount && <DetailRow label="Parameters" value={parameterCount} />}
                  {quantization && <DetailRow label="Quantization" value={quantization} />}
                  {vramRequired != null && <DetailRow label="VRAM" value={`${(vramRequired / 1024).toFixed(1)} GB`} />}
                  {contextWindow != null && (
                    <DetailRow
                      label="Max context"
                      value={contextWindow >= 1024 ? `${(contextWindow / 1024).toFixed(0)}K tokens` : `${contextWindow} tokens`}
                    />
                  )}
                  {modelId && (
                    <div className="mt-2 pt-2 border-t border-white/[0.04]">
                      <p className="text-[10px] text-gray-600 truncate font-mono">{modelId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
  );
}
