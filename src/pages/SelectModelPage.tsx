import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Cpu, Check, ArrowLeft, Library, Download } from "lucide-react";
import { AVAILABLE_MODELS, getModelById, DEFAULT_MODEL_ID } from "../lib/models";
import { useModelCache } from "../hooks/useModelCache";
import { useSEO } from "../hooks/useSEO";
import { saveDefaultModelId } from "../lib/storage";

export function SelectModelPage() {
  const navigate = useNavigate();
  const cache = useModelCache();

  useSEO({
    title: "Select Model",
    description: "Choose an AI model to start a private conversation in your browser. Select from your downloaded models or browse the library.",
    path: "/select-model",
  });
  const cachedModels = AVAILABLE_MODELS.filter((m) => cache.isModelCached(m.id));

  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    const stored = localStorage.getItem("browserai-selected-model");
    if (stored && cachedModels.some((m) => m.id === stored)) return stored;
    if (cachedModels.length > 0) return cachedModels[0].id;
    return DEFAULT_MODEL_ID;
  });

  const selectedModel = getModelById(selectedModelId);

  const handleLoad = () => {
    // Save selection so chat auto-loads it
    localStorage.setItem("browserai-selected-model", selectedModelId);
    sessionStorage.setItem("browserai-loaded-model", selectedModelId);
    saveDefaultModelId(selectedModelId);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-[#06060a] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Icon + heading */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
            <Brain className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Choose a Model</h1>
          <p className="text-sm text-gray-500">
            Select a downloaded model to start chatting, or browse the library to download one.
          </p>
        </div>

        {cachedModels.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              Downloaded Models ({cachedModels.length})
            </p>

            <div className="space-y-2">
              {cachedModels.map((m) => {
                const isSelected = m.id === selectedModelId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModelId(m.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-purple-500/10 border-purple-500/30"
                        : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.14]"
                    }`}
                  >
                    <Cpu className={`w-4 h-4 shrink-0 ${isSelected ? "text-purple-400" : "text-gray-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{m.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{m.provider} · {m.parameterCount}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleLoad}
              disabled={!cachedModels.some((m) => m.id === selectedModelId)}
              className="w-full py-3 px-4 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-purple-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed mt-2"
            >
              {selectedModel ? `Load ${selectedModel.name}` : "Load Selected Model"}
            </button>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 text-center mb-4">
            <Download className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-1">No models downloaded</p>
            <p className="text-xs text-gray-600">
              Visit the Model Library to download your first model
            </p>
          </div>
        )}

        <button
          onClick={() => navigate("/models")}
          className="w-full flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer mt-4 py-2"
        >
          <Library className="w-4 h-4" />
          Browse Model Library
        </button>
      </div>
    </div>
  );
}
