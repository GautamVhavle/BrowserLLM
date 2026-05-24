/**
 * Compact model dropdown selector (legacy component).
 * The full-screen `ModelModal` is now used instead in most places.
 */
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Cpu, Check } from "lucide-react";
import { AVAILABLE_MODELS, type ModelConfig } from "../../lib/models";

interface ModelSelectorProps {
  selectedModelId: string;
  loadedModelId: string | null;
  onSelect: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModelId,
  loadedModelId,
  onSelect,
  disabled,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = AVAILABLE_MODELS.find((m) => m.id === selectedModelId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 rounded-md hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Cpu className="w-3 h-3" />
        <span>{selected?.name ?? "Select model"}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-72 bg-[#0e0e18] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-white/[0.06]">
            <span className="text-xs font-medium text-gray-400">
              Select a model
            </span>
          </div>
          <div className="py-1">
            {AVAILABLE_MODELS.map((model) => (
              <ModelOption
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                isLoaded={model.id === loadedModelId}
                onSelect={() => {
                  onSelect(model.id);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModelOption({
  model,
  isSelected,
  isLoaded,
  onSelect,
}: {
  model: ModelConfig;
  isSelected: boolean;
  isLoaded: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors cursor-pointer ${
        isSelected
          ? "bg-white/[0.06]"
          : "hover:bg-white/[0.04]"
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
        <Cpu className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-200 font-medium">{model.name}</span>
          <span className="text-[10px] text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
            {model.parameterCount}
          </span>
          {isLoaded && (
            <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" />
              Loaded
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {model.provider} · {model.vramRequired} MB VRAM
        </div>
      </div>
      {isSelected && !isLoaded && (
        <Check className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
      )}
    </button>
  );
}
