/**
 * Floating toast-style cards showing background model download progress.
 * Positioned at the bottom-right of the viewport so the user can
 * continue chatting while another model downloads.
 */
import { Download, X, Check, AlertCircle } from "lucide-react";
import type { BackgroundDownload } from "../../types";

interface BackgroundDownloadIndicatorProps {
  downloads: BackgroundDownload[];
  onDismiss: (modelId: string) => void;
}

export function BackgroundDownloadIndicator({
  downloads,
  onDismiss,
}: BackgroundDownloadIndicatorProps) {
  const active = downloads.filter((d) => d.status !== "cancelled");
  if (active.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      {active.map((dl) => (
        <div
          key={dl.modelId}
          className="bg-[#0e0e16]/95 backdrop-blur-md border border-white/[0.08] rounded-xl p-3 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {dl.status === "downloading" && (
                <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
              )}
              {dl.status === "completed" && (
                <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
              )}
              {dl.status === "error" && (
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              )}
              <span className="text-xs text-gray-300 truncate">{dl.modelName}</span>
            </div>
            <button
              onClick={() => onDismiss(dl.modelId)}
              className="text-gray-500 hover:text-gray-300 transition-colors p-0.5 cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {dl.status === "downloading" && (
            <>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(dl.progress * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-500 truncate mr-2">{dl.text}</span>
                <span className="text-[10px] text-cyan-400 font-mono shrink-0">
                  {Math.round(dl.progress * 100)}%
                </span>
              </div>
            </>
          )}

          {dl.status === "completed" && (
            <div className="text-[11px] text-green-400">Ready to use</div>
          )}

          {dl.status === "error" && (
            <div className="text-[11px] text-red-400 truncate">{dl.error}</div>
          )}
        </div>
      ))}
    </div>
  );
}
