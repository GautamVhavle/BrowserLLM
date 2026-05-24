/**
 * Model loading screen shown before a model is ready.
 *
 * Two states:
 * - **Idle**: Shows model info card + "Load Model" button.
 * - **Loading**: Animated progress bar with percentage + cancel button.
 */
import type { LoadingProgress } from "../../types";
import { Brain, Cpu, HardDrive, X } from "lucide-react";

interface ModelLoadingBarProps {
  progress: LoadingProgress;
  isLoading: boolean;
  modelId: string;
  error: string | null;
  onLoadModel: () => void;
  onCancel?: () => void;
}

export function ModelLoadingBar({
  progress,
  isLoading,
  modelId,
  error,
  onLoadModel,
  onCancel,
}: ModelLoadingBarProps) {
  const percentage = Math.round(progress.progress * 100);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8 max-w-lg mx-auto relative z-10">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto">
          <Brain className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">BrowserAI</h1>
        <p className="text-gray-500 text-sm">
          Preparing your local AI assistant
        </p>
      </div>

      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isLoading ? (
        <div className="w-full space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-sm text-gray-400 space-y-3">
            <div className="flex items-center gap-3">
              <HardDrive className="w-4 h-4 text-purple-400 shrink-0" />
              <p>
                <span className="font-medium text-gray-200">Model:</span>{" "}
                {modelId}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
              <p>
                <span className="font-medium text-gray-200">Size:</span> ~1.5 GB
                (cached after first load)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-green-400 shrink-0" />
              <p>
                <span className="font-medium text-gray-200">Runs on:</span> Your
                GPU via WebGPU
              </p>
            </div>
          </div>
          <button
            onClick={onLoadModel}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium py-3.5 px-6 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-purple-500/20"
          >
            Load Model
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="w-full bg-white/[0.06] rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="truncate mr-4 text-gray-400">{progress.text}</span>
            <span className="font-mono shrink-0 text-purple-400">{percentage}%</span>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 py-2.5 px-4 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              Cancel Download
            </button>
          )}
        </div>
      )}
    </div>
  );
}
