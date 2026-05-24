/**
 * Post-generation statistics panel shown below the chat.
 *
 * Displays:
 * - SVG donut chart for context window usage (colored by fill %)
 * - Tokens/sec, output tokens, prompt tokens, generation time
 * - Context usage bar on wider screens
 */
import { Zap, Clock, Brain, MessageSquare } from "lucide-react";
import type { GenerationStats } from "../../types";

interface StatsPanelProps {
  stats: GenerationStats;
}

function ContextPieChart({ used, total }: { used: number; total: number }) {
  const percentage = Math.min((used / total) * 100, 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on usage
  const color =
    percentage > 80
      ? "text-red-400"
      : percentage > 50
        ? "text-orange-400"
        : "text-cyan-400";

  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        {/* Background ring */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-white/[0.06]"
        />
        {/* Progress ring */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${color} transition-all duration-500`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold text-white">{Math.round(percentage)}%</span>
        <span className="text-[8px] text-gray-500">used</span>
      </div>
    </div>
  );
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
          {/* Context pie chart */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <ContextPieChart used={stats.contextUsed} total={stats.contextTotal} />
            <span className="text-[10px] text-gray-500">Context</span>
          </div>

          {/* Stats grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-white">{stats.tokensPerSecond.toFixed(1)}</div>
                <div className="text-[10px] text-gray-500">tokens/sec</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-white">{stats.tokensGenerated}</div>
                <div className="text-[10px] text-gray-500">tokens out</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-white">{stats.promptTokens}</div>
                <div className="text-[10px] text-gray-500">prompt tokens</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-white">{(stats.generationTimeMs / 1000).toFixed(1)}s</div>
                <div className="text-[10px] text-gray-500">gen time</div>
              </div>
            </div>
          </div>

          {/* Context bar details */}
          <div className="hidden sm:flex flex-col gap-1 text-[10px] text-gray-500 shrink-0 min-w-[100px]">
            <div className="flex justify-between">
              <span>Total tokens</span>
              <span className="text-gray-400">{stats.totalTokens}</span>
            </div>
            <div className="flex justify-between">
              <span>Context used</span>
              <span className="text-gray-400">{stats.contextUsed} / {stats.contextTotal}</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.contextUsed / stats.contextTotal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
