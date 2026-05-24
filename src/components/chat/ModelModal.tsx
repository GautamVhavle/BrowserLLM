/**
 * Full-screen model selection modal with search.
 * Lists all 100+ built-in models plus any user-added custom models.
 * Selecting a model loads it immediately and closes the modal.
 */
import { useState, useEffect } from "react";
import { X, Cpu, Check, Plus, Trash2, ExternalLink, Search } from "lucide-react";
import { AVAILABLE_MODELS } from "../../lib/models";
import {
  loadCustomModels,
  saveCustomModel,
  deleteCustomModel as removeCustomModel,
  type CustomModel,
} from "../../lib/storage";

interface ModelModalProps {
  open: boolean;
  onClose: () => void;
  selectedModelId: string;
  loadedModelId: string | null;
  onSelect: (modelId: string) => void;
  onLoadModel: (modelId: string) => void;
  isLoadingModel: boolean;
}

export function ModelModal({
  open,
  onClose,
  selectedModelId,
  loadedModelId,
  onSelect,
  onLoadModel,
  isLoadingModel,
}: ModelModalProps) {
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customId, setCustomId] = useState("");
  const [customName, setCustomName] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setCustomModels(loadCustomModels());
      setSearch("");
      setShowAddForm(false);
    }
  }, [open]);

  if (!open) return null;

  const builtInModels = AVAILABLE_MODELS.map((m) => ({
    ...m,
    isCustom: false as const,
  }));

  const customModelConfigs = customModels.map((cm) => ({
    id: cm.id,
    name: cm.name,
    provider: "Custom",
    description: `Custom model: ${cm.id}`,
    parameterCount: "N/A",
    parameterCountNum: 0,
    vramRequired: 0,
    contextWindow: 0,
    quantization: "N/A",
    requiresF16: false,
    lowResource: false,
    categories: ["general" as const],
    hardwareTier: "medium" as const,
    family: "other" as const,
    isCustom: true as const,
  }));

  const allModels = [...builtInModels, ...customModelConfigs];

  const filtered = search
    ? allModels.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.id.toLowerCase().includes(search.toLowerCase()) ||
          m.provider.toLowerCase().includes(search.toLowerCase())
      )
    : allModels;

  const handleAddCustom = () => {
    const id = customId.trim();
    const name = customName.trim() || id;
    if (!id) return;
    if (allModels.some((m) => m.id === id)) return;
    saveCustomModel({ id, name, addedAt: Date.now() });
    setCustomModels(loadCustomModels());
    setCustomId("");
    setCustomName("");
    setShowAddForm(false);
  };

  const handleDeleteCustom = (id: string) => {
    removeCustomModel(id);
    setCustomModels(loadCustomModels());
    if (selectedModelId === id) {
      onSelect(AVAILABLE_MODELS[0].id);
    }
  };

  const handleSelectAndLoad = (id: string) => {
    onSelect(id);
    if (id !== loadedModelId) {
      onLoadModel(id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-[#0c0c16] border border-white/[0.1] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden sm:m-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Select a Model
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
              Choose a model or add your own WebLLM-compatible model
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-5 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models..."
              className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Model list */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-2 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-600 text-sm py-8">
              No models match your search
            </div>
          ) : (
            filtered.map((model) => {
              const isSelected = model.id === selectedModelId;
              const isLoaded = model.id === loadedModelId;
              return (
                <button
                  key={model.id}
                  onClick={() => handleSelectAndLoad(model.id)}
                  disabled={isLoadingModel}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                    isSelected
                      ? "bg-purple-500/10 border-purple-500/30"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">
                          {model.name}
                        </span>
                        <span className="text-[10px] text-gray-500 bg-white/[0.06] px-1.5 py-0.5 rounded">
                          {model.provider}
                        </span>
                        {model.parameterCount !== "N/A" && (
                          <span className="text-[10px] text-gray-500 bg-white/[0.06] px-1.5 py-0.5 rounded">
                            {model.parameterCount}
                          </span>
                        )}
                        {isLoaded && (
                          <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            Active
                          </span>
                        )}
                        {isSelected && !isLoaded && (
                          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-1 line-clamp-2">
                        {model.description}
                      </p>
                      {model.vramRequired > 0 && (
                        <div className="flex items-center gap-2 sm:gap-3 mt-2 text-[10px] text-gray-600 flex-wrap">
                          <span>{model.vramRequired} MB VRAM</span>
                          <span className="hidden sm:inline">·</span>
                          <span>{model.quantization}</span>
                          {model.contextWindow > 0 && (
                            <>
                              <span className="hidden sm:inline">·</span>
                              <span>
                                {model.contextWindow.toLocaleString()} ctx
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {model.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustom(model.id);
                        }}
                        className="text-gray-600 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Add custom model */}
        <div className="border-t border-white/[0.06] p-4 sm:p-5">
          {!showAddForm ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Custom Model
              </button>
              <a
                href="https://github.com/mlc-ai/web-llm/blob/main/src/config.ts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
              >
                Browse models
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  Add Custom Model
                </span>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setCustomId("");
                    setCustomName("");
                  }}
                  className="text-gray-500 hover:text-gray-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="WebLLM Model ID (e.g. Llama-3.1-8B-Instruct-q4f32_1-MLC)"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/30"
              />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Display name (optional)"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/30"
              />
              <button
                onClick={handleAddCustom}
                disabled={!customId.trim()}
                className="w-full bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg py-2.5 text-sm font-medium hover:bg-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Add Model
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
