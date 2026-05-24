/**
 * Full model catalog page.
 *
 * Features:
 * - Featured/recommended models section at the top
 * - Opt-in hardware detection with permission prompt
 * - Search + multi-filter (family, category, hardware tier)
 * - Compatibility tick marks per model
 * - Card actions: set default, download, delete cache
 * - Clean overview cards with action menus
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Cpu,
  Sparkles,
  ArrowLeft,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  Trash2,
  Filter,
  Zap,
  Code,
  Calculator,
  Brain,
  Eye,
  ShieldOff,
  Star,
  Shield,
  Check,
  X,
  ChevronUp,
  Gauge,
  MemoryStick,
  Layers,
  Globe,
  Info,
  Loader2,
  CircleX,
} from "lucide-react";
import {
  MODEL_CATALOG,
  FAMILY_LABELS,
  CATEGORY_LABELS,
  TIER_LABELS,
  type ModelFamily,
  type ModelCategory,
  type HardwareTier,
  type CatalogModel,
} from "../lib/modelCatalog";
import { useHardwareDetect, type HardwareInfo } from "../hooks/useHardwareDetect";
import { useModelCache } from "../hooks/useModelCache";
import { useModelDownloader } from "../hooks/useModelDownloader";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";
import {
  loadDefaultModelId,
  saveDefaultModelId,
  loadCustomModels,
  saveCustomModel,
  deleteCustomModel,
  type CustomModel,
} from "../lib/storage";
import { Plus, ExternalLink, ArrowUpDown } from "lucide-react";

/** Logo image path and fallback initials for each model family */
const FAMILY_BRAND: Record<ModelFamily, { logo: string | null; initials: string; bg: string; text: string }> = {
  llama:     { logo: "/logos/meta-llama.png",   initials: "Ll", bg: "bg-blue-500/15",   text: "text-blue-400" },
  qwen:      { logo: "/logos/qwen.png",         initials: "Qw", bg: "bg-violet-500/15", text: "text-violet-400" },
  phi:       { logo: "/logos/microsoft.png",     initials: "Phi", bg: "bg-sky-500/15",   text: "text-sky-400" },
  gemma:     { logo: "/logos/google.png",        initials: "G",  bg: "bg-cyan-500/15",   text: "text-cyan-400" },
  mistral:   { logo: "/logos/mistral.png",       initials: "M",  bg: "bg-orange-500/15", text: "text-orange-400" },
  deepseek:  { logo: "/logos/deepseek.png",      initials: "DS", bg: "bg-indigo-500/15", text: "text-indigo-400" },
  smollm:    { logo: "/logos/huggingface.png",   initials: "Sm", bg: "bg-amber-500/15",  text: "text-amber-400" },
  olmo:      { logo: "/logos/allenai.png",       initials: "O",  bg: "bg-teal-500/15",   text: "text-teal-400" },
  stablelm:  { logo: "/logos/stability.png",     initials: "St", bg: "bg-purple-500/15", text: "text-purple-400" },
  redpajama: { logo: "/logos/togetherai.png",    initials: "RP", bg: "bg-red-500/15",    text: "text-red-400" },
  tinyllama: { logo: "/logos/meta-llama.png",    initials: "Tl", bg: "bg-blue-500/15",   text: "text-blue-300" },
  ministral: { logo: "/logos/mistral.png",       initials: "Mi", bg: "bg-orange-500/15", text: "text-orange-300" },
  hermes:    { logo: "/logos/nousresearch.png",  initials: "H",  bg: "bg-emerald-500/15",text: "text-emerald-400" },
  other:     { logo: null,                       initials: "?",  bg: "bg-gray-500/15",   text: "text-gray-400" },
};

function FamilyLogo({ family, size = "md" }: { family: ModelFamily; size?: "sm" | "md" }) {
  const brand = FAMILY_BRAND[family];
  const sizeClass = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  if (brand.logo) {
    return (
      <img
        src={brand.logo}
        alt={FAMILY_LABELS[family]}
        className={`${sizeClass} rounded-lg object-cover shrink-0`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-lg ${brand.bg} flex items-center justify-center shrink-0 font-bold ${brand.text} select-none text-[11px]`}>
      {brand.initials}
    </div>
  );
}

type SortOption = "name" | "size-asc" | "size-desc" | "vram-asc" | "vram-desc" | "context-desc";
const SORT_LABELS: Record<SortOption, string> = {
  "name": "Name (A-Z)",
  "size-asc": "Size (smallest first)",
  "size-desc": "Size (largest first)",
  "vram-asc": "VRAM (lowest first)",
  "vram-desc": "VRAM (highest first)",
  "context-desc": "Context (largest first)",
};

const CATEGORY_ICONS: Record<ModelCategory, typeof Cpu> = {
  general: Sparkles,
  coding: Code,
  math: Calculator,
  reasoning: Brain,
  vision: Eye,
  uncensored: ShieldOff,
  embedding: Cpu,
};

const FEATURED_MODEL_IDS = [
  "gemma3-1b-it-q4f16_1-MLC",
  "Qwen3.5-2B-q4f16_1-MLC",
  "Llama-3.2-3B-Instruct-q4f32_1-MLC",
  "Phi-4-mini-instruct-q4f16_1-MLC",
  "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
  "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC",
];

function ModelCard({
  model,
  isCompatible,
  isCached,
  isDefault,
  hardwareDetected,
  onClick,
}: {
  model: CatalogModel;
  isCompatible: boolean | null;
  isCached: boolean;
  isDefault: boolean;
  hardwareDetected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left w-full bg-white/[0.02] border rounded-xl p-4 transition-all group cursor-pointer hover:bg-white/[0.05] hover:shadow-lg hover:shadow-black/20 ${
        isDefault
          ? "border-purple-500/30 ring-1 ring-purple-500/10"
          : isCompatible === false
          ? "border-white/[0.04] opacity-50"
          : "border-white/[0.06] hover:border-white/[0.14]"
      }`}
    >
      {/* Row 1: Icon + Name + Compatibility */}
      <div className="flex items-start gap-3">
        <FamilyLogo family={model.family} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white truncate">{model.name}</h3>
            <span className="text-[10px] text-gray-500 bg-white/[0.06] px-1.5 py-0.5 rounded shrink-0">
              {model.parameterCount}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">{model.provider}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {hardwareDetected && isCompatible !== null && (
            isCompatible ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400/80" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500/80" />
            )
          )}
        </div>
      </div>

      {/* Description, single line */}
      <p className="text-[11px] text-gray-500 mt-2.5 line-clamp-1 leading-relaxed">{model.description}</p>

      {/* Bottom: specs + status badges */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          <span>{(model.vramRequired / 1024).toFixed(1)} GB</span>
          <span className="text-gray-700/50">·</span>
          <span>
            {model.contextWindow >= 1024
              ? `${(model.contextWindow / 1024).toFixed(0)}K ctx`
              : `${model.contextWindow} ctx`}
          </span>
          <span className="text-gray-700/50">·</span>
          <span>{model.quantization}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isCached && (
            <span className="text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
              Downloaded
            </span>
          )}
          {isDefault && (
            <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">
              Default
            </span>
          )}
        </div>
      </div>

      {/* Hover hint */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

/** Full detail modal, shown when a card is clicked. */
function ModelDetailModal({
  model,
  isCompatible,
  isCached,
  isDefault,
  hardwareDetected,
  onClose,
  onDownload,
  onDelete,
  onSetDefault,
  isDownloading,
  downloadProgress,
}: {
  model: CatalogModel;
  isCompatible: boolean | null;
  isCached: boolean;
  isDefault: boolean;
  hardwareDetected: boolean;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isDownloading?: boolean;
  downloadProgress?: number;
}) {
  const tierInfo = TIER_LABELS[model.hardwareTier];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0a0a14] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl shadow-2xl mx-0 sm:mx-4 max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a14]/95 backdrop-blur-md z-10 px-5 pt-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <FamilyLogo family={model.family} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-white">{model.name}</h2>
                <span className="text-[10px] text-gray-500 bg-white/[0.06] px-2 py-0.5 rounded">{model.parameterCount}</span>
                {isCached && (
                  <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1">
                    <Download className="w-2.5 h-2.5" /> Downloaded
                  </span>
                )}
                {isDefault && (
                  <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5" /> Default
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{model.provider} · {FAMILY_LABELS[model.family]}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Description */}
          <p className="text-sm text-gray-300 leading-relaxed">{model.description}</p>

          {/* Compatibility banner */}
          {hardwareDetected && isCompatible !== null && (
            <div className={`flex items-center gap-2.5 p-3 rounded-lg border ${
              isCompatible
                ? "bg-green-500/[0.06] border-green-500/15 text-green-400"
                : "bg-yellow-500/[0.06] border-yellow-500/15 text-yellow-400"
            }`}>
              {isCompatible ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <p className="text-xs">
                {isCompatible
                  ? "This model is compatible with your device"
                  : model.requiresF16
                  ? "This model requires Shader F16 support which your device may not have"
                  : "This model may exceed your available VRAM"}
              </p>
            </div>
          )}

          {/* Specs Grid */}
          <div>
            <h3 className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-2.5">Specifications</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-[10px] text-gray-500 mb-0.5">VRAM Required</p>
                <p className="text-sm text-gray-200 font-medium">{(model.vramRequired / 1024).toFixed(1)} GB</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{model.vramRequired.toLocaleString()} MB</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-[10px] text-gray-500 mb-0.5">Context Window</p>
                <p className="text-sm text-gray-200 font-medium">
                  {model.contextWindow >= 1024
                    ? `${(model.contextWindow / 1024).toFixed(0)}K tokens`
                    : `${model.contextWindow} tokens`}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">{model.contextWindow.toLocaleString()}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-[10px] text-gray-500 mb-0.5">Quantization</p>
                <p className="text-sm text-gray-200 font-medium">{model.quantization}</p>
                {model.requiresF16 && (
                  <p className="text-[10px] text-yellow-400 mt-0.5">Requires F16</p>
                )}
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <p className="text-[10px] text-gray-500 mb-0.5">Hardware Tier</p>
                <p className={`text-sm font-medium ${
                  tierInfo.color === "green" ? "text-green-400" :
                  tierInfo.color === "yellow" ? "text-yellow-400" :
                  tierInfo.color === "orange" ? "text-orange-400" :
                  "text-red-400"
                }`}>
                  {tierInfo.label}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {model.lowResource ? "Low resource friendly" : "Standard requirements"}
                </p>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-2.5">Capabilities</h3>
            <div className="flex flex-wrap gap-1.5">
              {model.categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <span
                    key={cat}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${
                      cat === "uncensored"
                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                        : "text-gray-300 bg-white/[0.04] border-white/[0.08]"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {CATEGORY_LABELS[cat]}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-2.5">Details</h3>
            <div className="space-y-0">
              {[
                { label: "Model ID", value: model.id, mono: true },
                { label: "Family", value: FAMILY_LABELS[model.family] },
                { label: "Provider", value: model.provider },
                { label: "Parameters", value: `${model.parameterCount} (${model.parameterCountNum}B)` },
                { label: "Requires F16", value: model.requiresF16 ? "Yes" : "No", highlight: model.requiresF16 },
                { label: "Low Resource", value: model.lowResource ? "Yes, runs on most devices" : "No" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-b-0">
                  <span className="text-xs text-gray-500">{row.label}</span>
                  <span
                    className={`text-xs text-right max-w-[60%] truncate ${
                      row.mono ? "font-mono text-gray-400" :
                      row.highlight ? "text-yellow-400" :
                      "text-gray-300"
                    }`}
                    title={row.value}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky action footer */}
        <div className="sticky bottom-0 bg-[#0a0a14]/95 backdrop-blur-md border-t border-white/[0.06] px-5 py-4">
          <div className="flex gap-2">
            {isCached ? (
              <>
                <button
                  onClick={onSetDefault}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors cursor-pointer active:scale-95 ${
                    isDefault
                      ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]"
                  }`}
                  title={isDefault ? "Already set as default" : "Set as default model"}
                >
                  <Star className={`w-3.5 h-3.5 ${isDefault ? "fill-purple-400" : ""}`} />
                  <span className="hidden sm:inline">{isDefault ? "Default Model" : "Set as Default"}</span>
                  <span className="sm:hidden">{isDefault ? "Default" : "Set Default"}</span>
                </button>
                <button
                  onClick={onDelete}
                  className="px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.06] transition-colors cursor-pointer active:scale-95"
                  title="Delete from cache"
                >
                  <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </>
            ) : isDownloading ? (
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                  <span className="text-xs text-gray-300">Downloading...</span>
                  <span className="text-xs text-gray-500 ml-auto">{Math.round((downloadProgress ?? 0) * 100)}%</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((downloadProgress ?? 0) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={onDownload}
                className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg bg-white/[0.06] text-gray-200 border border-white/[0.1] text-xs sm:text-sm font-medium hover:bg-white/[0.1] transition-colors cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">DL</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const TIER_COLORS = {
  low: "text-green-400 bg-green-500/10 border-green-500/20",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  ultra: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

const TIER_DESCRIPTIONS = {
  low: "Basic models (< 2.5 GB), good for quick tasks",
  medium: "Mid-range models (2.5-6 GB), balanced quality and speed",
  high: "Large models (6-12 GB), high quality responses",
  ultra: "Premium models (12+ GB), best available quality",
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function getBrowserName(ua: string): string {
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Chrome/")) return "Google Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox/")) return "Firefox";
  return "Unknown";
}

/** Detailed hardware panel shown after detection. */
function HardwareDetailsPanel({ hardware }: { hardware: HardwareInfo & { detect: () => void } }) {
  const [expanded, setExpanded] = useState(false);
  const tierColor = TIER_COLORS[hardware.recommendedTier];

  const compatibleCount = MODEL_CATALOG.filter((m) => {
    if (m.requiresF16 && !hardware.shaderF16) return false;
    if (hardware.estimatedVRAM > 0 && m.vramRequired > hardware.estimatedVRAM) return false;
    return true;
  }).length;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Your Device</h2>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
        >
          {expanded ? "Less" : "More details"}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Top-level summary, always visible */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <div className="bg-white/[0.03] rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Cpu className="w-3 h-3 text-purple-400" />
            <p className="text-[10px] text-gray-500">GPU</p>
          </div>
          <p className="text-xs text-gray-200 font-medium truncate">
            {hardware.gpuVendor ? `${hardware.gpuVendor.charAt(0).toUpperCase()}${hardware.gpuVendor.slice(1)}` : "Unknown"}
          </p>
          {hardware.gpuArchitecture && hardware.gpuArchitecture !== "Unknown" && (
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{hardware.gpuArchitecture}</p>
          )}
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <MemoryStick className="w-3 h-3 text-cyan-400" />
            <p className="text-[10px] text-gray-500">Est. VRAM</p>
          </div>
          <p className="text-xs text-gray-200 font-medium">
            {hardware.estimatedVRAM > 0 ? `~${(hardware.estimatedVRAM / 1024).toFixed(1)} GB` : "Unknown"}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Max model: ~{(hardware.maxModelSizeMB / 1024).toFixed(1)} GB
          </p>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge className="w-3 h-3 text-amber-400" />
            <p className="text-[10px] text-gray-500">Recommended Tier</p>
          </div>
          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${tierColor}`}>
            {hardware.recommendedTier.charAt(0).toUpperCase() + hardware.recommendedTier.slice(1)}
          </span>
          <p className="text-[10px] text-gray-500 mt-1 leading-tight">
            {TIER_DESCRIPTIONS[hardware.recommendedTier]}
          </p>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Layers className="w-3 h-3 text-green-400" />
            <p className="text-[10px] text-gray-500">Compatible Models</p>
          </div>
          <p className="text-xs text-gray-200 font-medium">{compatibleCount} / {MODEL_CATALOG.length}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {Math.round((compatibleCount / MODEL_CATALOG.length) * 100)}% of library
          </p>
        </div>
      </div>

      {/* API & Feature support row, always visible */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-1">
        {[
          { label: "WebGPU", ok: true },
          { label: "Shader F16", ok: hardware.shaderF16 },
          { label: `${hardware.hardwareConcurrency} CPU Cores`, ok: hardware.hardwareConcurrency > 0 },
          { label: hardware.deviceMemory > 0 ? `${hardware.deviceMemory} GB RAM` : "RAM N/A", ok: hardware.deviceMemory > 0 },
          { label: getBrowserName(hardware.userAgent), ok: true },
          { label: hardware.platform || "Unknown OS", ok: true },
        ].map((item) => (
          <div key={item.label} className="bg-white/[0.02] rounded-lg px-2 py-1.5 text-center">
            <p className={`text-[10px] flex items-center justify-center gap-1 ${item.ok ? "text-green-400" : "text-yellow-400"}`}>
              {item.ok ? <Check className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
              <span className="truncate">{item.label}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-600 mt-2 leading-relaxed text-center">
        Estimates are approximate, based on browser-reported GPU limits. Actual capabilities may vary.
      </p>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
          {/* GPU Limits */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="w-3 h-3 text-gray-400" />
              <p className="text-[11px] text-gray-400 font-medium">GPU Limits</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: "Max Buffer Size", value: formatBytes(hardware.maxBufferSize) },
                { label: "Max Texture 2D", value: `${hardware.maxTextureDimension2D.toLocaleString()} px` },
                { label: "Max Bind Groups", value: String(hardware.maxBindGroups) },
                { label: "Workgroup Size", value: String(hardware.maxComputeWorkgroupSize) },
                { label: "Invocations/Workgroup", value: hardware.maxComputeInvocationsPerWorkgroup.toLocaleString() },
                { label: "Workgroups/Dimension", value: hardware.maxComputeWorkgroupsPerDimension.toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="bg-white/[0.02] rounded-lg p-2">
                  <p className="text-[10px] text-gray-500">{item.label}</p>
                  <p className="text-[11px] text-gray-300 font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supported WebGPU Features */}
          {hardware.supportedFeatures.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Globe className="w-3 h-3 text-gray-400" />
                <p className="text-[11px] text-gray-400 font-medium">
                  WebGPU Features ({hardware.supportedFeatures.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hardware.supportedFeatures.map((f) => (
                  <span
                    key={f}
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      f === "shader-f16"
                        ? "text-green-400 bg-green-500/10 border-green-500/20"
                        : "text-gray-400 bg-white/[0.03] border-white/[0.06]"
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What this means */}
          <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.05]">
            <p className="text-[11px] text-gray-400 font-medium mb-1.5">What does this mean?</p>
            <ul className="text-[11px] text-gray-500 space-y-1 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-gray-600 shrink-0">•</span>
                <span><strong className="text-gray-400">VRAM</strong> determines the maximum model size you can load. Larger models need more VRAM.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 shrink-0">•</span>
                <span><strong className="text-gray-400">Shader F16</strong> enables half-precision models (q4f16) which are smaller and faster. Without it, use q4f32 variants.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 shrink-0">•</span>
                <span><strong className="text-gray-400">Buffer Size</strong> is the raw maximum a single GPU buffer can hold, directly impacts model layer loading.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gray-600 shrink-0">•</span>
                <span><strong className="text-gray-400">CPU Cores</strong> affect model loading speed and tokenization. More cores = faster preparation.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/** Modal for adding a custom WebLLM model ID. */
function AddCustomModelModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (model: CustomModel) => void;
}) {
  const [modelId, setModelId] = useState("");
  const [displayName, setDisplayName] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    const id = modelId.trim();
    if (!id) return;
    const name = displayName.trim() || id;
    onAdd({ id, name, addedAt: Date.now() });
    setModelId("");
    setDisplayName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0c0c16] border border-white/[0.1] rounded-xl shadow-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-white">Add Custom Model</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Enter any WebLLM-compatible model ID to try it out
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="text-[11px] text-gray-400 mb-1 block">Model ID *</label>
            <input
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="e.g. Llama-3.1-8B-Instruct-q4f32_1-MLC"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/30"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 mb-1 block">Display Name (optional)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Friendly name for the model"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/30"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <a
            href="https://github.com/mlc-ai/web-llm/blob/main/src/config.ts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            Browse available model IDs on GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex gap-2 p-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-white/[0.08] text-gray-400 text-sm hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!modelId.trim()}
            className="flex-1 py-2 px-4 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25 text-sm font-medium hover:bg-purple-500/25 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Add Model
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModelsPage() {
  const navigate = useNavigate();
  const hardware = useHardwareDetect();
  const cache = useModelCache();
  const downloader = useModelDownloader();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<ModelFamily | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | "all">("all");
  const [selectedTier, setSelectedTier] = useState<HardwareTier | "all">("all");
  const [showCompatibleOnly, setShowCompatibleOnly] = useState(false);
  const [defaultModelId, setDefaultModelId] = useState<string | null>(
    () => loadDefaultModelId()
  );
  const [customModels, setCustomModels] = useState<CustomModel[]>(() => loadCustomModels());
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CatalogModel | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const featuredModels = useMemo(
    () =>
      FEATURED_MODEL_IDS
        .map((id) => MODEL_CATALOG.find((m) => m.id === id))
        .filter(Boolean) as CatalogModel[],
    []
  );

  // Models that are downloaded (in cache)
  const cachedModels = useMemo(
    () => MODEL_CATALOG.filter((m) => cache.isModelCached(m.id)),
    [cache]
  );

  const filtered = useMemo(() => {
    let models = MODEL_CATALOG;

    if (search) {
      const q = search.toLowerCase();
      models = models.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    if (selectedFamily !== "all") models = models.filter((m) => m.family === selectedFamily);
    if (selectedCategory !== "all") models = models.filter((m) => m.categories.includes(selectedCategory));
    if (selectedTier !== "all") models = models.filter((m) => m.hardwareTier === selectedTier);
    if (showCompatibleOnly && hardware.detected && hardware.estimatedVRAM > 0) {
      models = models.filter(
        (m) =>
          m.vramRequired <= hardware.estimatedVRAM &&
          (!m.requiresF16 || hardware.shaderF16)
      );
    }

    return models;
  }, [search, selectedFamily, selectedCategory, selectedTier, showCompatibleOnly, hardware]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case "name":         return list.sort((a, b) => a.name.localeCompare(b.name));
      case "size-asc":     return list.sort((a, b) => a.parameterCountNum - b.parameterCountNum);
      case "size-desc":    return list.sort((a, b) => b.parameterCountNum - a.parameterCountNum);
      case "vram-asc":     return list.sort((a, b) => a.vramRequired - b.vramRequired);
      case "vram-desc":    return list.sort((a, b) => b.vramRequired - a.vramRequired);
      case "context-desc": return list.sort((a, b) => b.contextWindow - a.contextWindow);
      default:             return list;
    }
  }, [filtered, sortBy]);

  const families = useMemo(() => {
    const set = new Set(MODEL_CATALOG.map((m) => m.family));
    return Array.from(set).sort();
  }, []);

  const isCompatible = (model: CatalogModel): boolean | null => {
    if (!hardware.detected) return null;
    if (!hardware.webgpuSupported) return false;
    if (model.requiresF16 && !hardware.shaderF16) return false;
    if (hardware.estimatedVRAM > 0 && model.vramRequired > hardware.estimatedVRAM) return false;
    return true;
  };

  const handleUseModel = (modelId: string) => {
    localStorage.setItem("browserai-selected-model", modelId);
    navigate("/chat");
  };

  const handleDownload = (modelId: string) => {
    const model = MODEL_CATALOG.find((m) => m.id === modelId);
    const name = model?.name ?? modelId;
    
    // Show notification
    toast.info(`Downloading ${name}...`);
    
    // Scroll to top on mobile only (viewport width < 768px)
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    
    downloader.startDownload(modelId, name).then(() => {
      // Refresh cache list after download completes
      cache.refresh();
      toast.success(`${name} downloaded successfully!`);
    }).catch(() => {
      toast.error(`Failed to download ${name}`);
    });
  };

  const handleSetDefault = (modelId: string) => {
    saveDefaultModelId(modelId);
    setDefaultModelId(modelId);
  };

  const handleDeleteCache = async (modelId: string) => {
    await cache.deleteModelCache(modelId);
    cache.refresh();
  };

  const handleAddCustomModel = (model: CustomModel) => {
    saveCustomModel(model);
    setCustomModels(loadCustomModels());
  };

  const handleDeleteCustomModel = (id: string) => {
    deleteCustomModel(id);
    setCustomModels(loadCustomModels());
  };

  // Build custom model cards compatible with ModelCard
  const customModelCards: CatalogModel[] = customModels.map((cm) => ({
    id: cm.id,
    name: cm.name,
    family: "other" as const,
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
  }));

  const hasActiveFilters = search || selectedFamily !== "all" || selectedCategory !== "all" || selectedTier !== "all" || showCompatibleOnly;

  return (
    <div className="min-h-screen bg-[#06060a] bg-dot-grid text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Model Library
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                {MODEL_CATALOG.length} models available to run in your browser
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCustom(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] text-gray-300 border border-white/[0.1] text-sm hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Model</span>
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] text-gray-300 border border-white/[0.1] text-sm hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              Open Chat
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hardware Detection Card, opt-in */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 sm:p-5 mb-6">
          {!hardware.detected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white mb-1">Check Device Compatibility</h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    We'll detect your GPU, VRAM, compute limits, and shader support to show which
                    models will run on your device. Everything stays local. No data is sent anywhere.
                  </p>
                </div>
              </div>
              <button
                onClick={hardware.detect}
                disabled={hardware.loading}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-sm font-medium hover:bg-cyan-500/25 transition-colors cursor-pointer disabled:opacity-50"
              >
                {hardware.loading ? (
                  <span className="animate-pulse">Detecting...</span>
                ) : (
                  <>
                    <Monitor className="w-4 h-4" />
                    Detect Hardware
                  </>
                )}
              </button>
            </div>
          ) : hardware.error ? (
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-white mb-0.5">Hardware Detection</h2>
                <p className="text-xs text-red-400">{hardware.error}</p>
              </div>
            </div>
          ) : (
            <HardwareDetailsPanel hardware={hardware} />
          )}
        </div>

        {/* Active Downloads */}
        {downloader.downloads.filter((d) => d.status === "downloading").length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <h2 className="text-sm font-semibold text-white">Downloading</h2>
            </div>
            <div className="space-y-2">
              {downloader.downloads
                .filter((d) => d.status === "downloading")
                .map((dl) => (
                  <div
                    key={dl.modelId}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{dl.modelName}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{dl.text}</p>
                      </div>
                      <button
                        onClick={() => downloader.cancelDownload(dl.modelId)}
                        className="shrink-0 ml-3 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Cancel download"
                      >
                        <CircleX className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(dl.progress * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 text-right">
                      {Math.round(dl.progress * 100)}%
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Download errors / completed notifications */}
        {downloader.downloads.filter((d) => d.status === "error" || d.status === "completed" || d.status === "cancelled").length > 0 && (
          <div className="mb-6 space-y-2">
            {downloader.downloads
              .filter((d) => d.status === "error" || d.status === "completed" || d.status === "cancelled")
              .map((dl) => (
                <div
                  key={dl.modelId}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    dl.status === "completed"
                      ? "bg-green-500/[0.06] border-green-500/15"
                      : dl.status === "cancelled"
                      ? "bg-yellow-500/[0.06] border-yellow-500/15"
                      : "bg-red-500/[0.06] border-red-500/15"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {dl.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    ) : dl.status === "cancelled" ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-xs truncate ${
                        dl.status === "completed" ? "text-green-400" :
                        dl.status === "cancelled" ? "text-yellow-400" :
                        "text-red-400"
                      }`}>
                        {dl.modelName} {dl.status === "completed" ? "downloaded successfully" : dl.status === "cancelled" ? "cancelled" : `failed: ${dl.error}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloader.dismissDownload(dl.modelId)}
                    className="shrink-0 ml-2 text-gray-500 hover:text-gray-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Downloaded Models */}
        {cachedModels.length > 0 && !hasActiveFilters && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-4 h-4 text-green-400" />
              <h2 className="text-sm font-semibold text-white">Downloaded Models</h2>
              <span className="text-[10px] text-gray-500">({cachedModels.length} ready to use)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cachedModels.map((model) => (
                <div
                  key={model.id}
                  className="relative bg-white/[0.02] border border-green-500/15 rounded-xl p-4 transition-all hover:bg-white/[0.04] hover:border-green-500/25"
                >
                  <div className="flex items-start gap-3">
                    <FamilyLogo family={model.family} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white truncate">{model.name}</h3>
                        <span className="text-[10px] text-gray-500 bg-white/[0.06] px-1.5 py-0.5 rounded shrink-0">
                          {model.parameterCount}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{model.provider}</p>
                    </div>
                    {defaultModelId === model.id && (
                      <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20 shrink-0">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-600 mt-2">
                    <span>{(model.vramRequired / 1024).toFixed(1)} GB</span>
                    <span className="text-gray-700/50">·</span>
                    <span>{model.contextWindow >= 1024 ? `${(model.contextWindow / 1024).toFixed(0)}K ctx` : `${model.contextWindow} ctx`}</span>
                    <span className="text-gray-700/50">·</span>
                    <span>{model.quantization}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => { handleSetDefault(model.id); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        defaultModelId === model.id
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : "border-white/[0.08] text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                      }`}
                      title={defaultModelId === model.id ? "Default model" : "Set as default"}
                    >
                      <Star className={`w-3.5 h-3.5 ${defaultModelId === model.id ? "fill-purple-400" : ""}`} />
                      {defaultModelId === model.id ? "Default" : "Set Default"}
                    </button>
                    <button
                      onClick={() => handleDeleteCache(model.id)}
                      className="p-2 rounded-lg border border-white/[0.08] text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.06] transition-colors cursor-pointer"
                      title="Delete from cache"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Models */}
        {!hasActiveFilters && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Featured Models</h2>
              <span className="text-[10px] text-gray-500">Best picks to get started</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {featuredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isCompatible={isCompatible(model)}
                  isCached={cache.isModelCached(model.id)}
                  isDefault={defaultModelId === model.id}
                  hardwareDetected={hardware.detected}
                  onClick={() => setSelectedModel(model)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-white">All Models</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-500 hover:text-gray-300 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value as any)}
                  className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 pr-7 text-xs text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">Family</option>
                  {families.map((f) => (
                    <option key={f} value={f}>{FAMILY_LABELS[f]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 pr-7 text-xs text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">Category</option>
                  {(Object.keys(CATEGORY_LABELS) as ModelCategory[])
                    .filter((c) => c !== "embedding")
                    .map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as any)}
                  className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 pr-7 text-xs text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tier</option>
                  {(Object.keys(TIER_LABELS) as HardwareTier[]).map((t) => (
                    <option key={t} value={t}>{TIER_LABELS[t].label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>

              {hardware.detected && hardware.webgpuSupported && (
                <button
                  onClick={() => setShowCompatibleOnly(!showCompatibleOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                    showCompatibleOnly
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  Compatible
                </button>
              )}

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-lg pl-7 pr-3 py-2 text-xs text-gray-200 focus:outline-none cursor-pointer"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                    <option key={s} value={s}>{SORT_LABELS[s]}</option>
                  ))}
                </select>
                <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 mb-3">
            {sorted.length} of {MODEL_CATALOG.length} models
          </p>
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isCompatible={isCompatible(model)}
              isCached={cache.isModelCached(model.id)}
              isDefault={defaultModelId === model.id}
              hardwareDetected={hardware.detected}
              onClick={() => setSelectedModel(model)}
            />
          ))}
        </div>

        {/* Custom Models Section */}
        {customModelCards.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Your Custom Models</h2>
              <span className="text-[10px] text-gray-500">({customModelCards.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {customModelCards.map((model) => (
                <div
                  key={model.id}
                  className="relative bg-white/[0.02] border border-dashed border-purple-500/20 rounded-xl p-4 transition-all hover:bg-white/[0.04] hover:border-purple-500/30"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-white truncate">{model.name}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">{model.id}</p>
                    </div>
                    <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20 shrink-0">
                      Custom
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleUseModel(model.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25 text-xs font-medium hover:bg-purple-500/25 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3 h-3" />
                      Try Model
                    </button>
                    <button
                      onClick={() => handleDeleteCustomModel(model.id)}
                      className="p-2 rounded-lg border border-white/[0.08] text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                      title="Remove custom model"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Cpu className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No models match your filters</p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedFamily("all");
                setSelectedCategory("all");
                setSelectedTier("all");
                setShowCompatibleOnly(false);
              }}
              className="text-xs text-purple-400 hover:text-purple-300 mt-2 cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Add Custom Model Modal */}
      <AddCustomModelModal
        open={showAddCustom}
        onClose={() => setShowAddCustom(false)}
        onAdd={handleAddCustomModel}
      />

      {/* Model Detail Modal */}
      {selectedModel && (
        <ModelDetailModal
          model={selectedModel}
          isCompatible={isCompatible(selectedModel)}
          isCached={cache.isModelCached(selectedModel.id)}
          isDefault={defaultModelId === selectedModel.id}
          hardwareDetected={hardware.detected}
          onClose={() => setSelectedModel(null)}
          onDownload={() => { handleDownload(selectedModel.id); setSelectedModel(null); }}
          onDelete={() => { handleDeleteCache(selectedModel.id); setSelectedModel(null); }}
          onSetDefault={() => { handleSetDefault(selectedModel.id); }}
          isDownloading={downloader.isDownloading(selectedModel.id)}
          downloadProgress={downloader.getDownload(selectedModel.id)?.progress ?? 0}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
