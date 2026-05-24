/**
 * Main chat interface shell.
 *
 * Composes the sidebar, header, message area, stats panel, input bar,
 * model selector modal, and background download indicator into a single
 * responsive layout. The header includes a dropdown of downloaded models
 * so users can quickly switch between cached models. If no model is loaded,
 * a model picker screen is shown instead of the chat.
 */
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  PanelLeft,
  ChevronDown,
  Download,
  Check,
  Library,
  Brain,
  X,
  Cpu,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { OnlineIndicator } from "../ui";
import { BackgroundDownloadIndicator } from "../ui/BackgroundDownloadIndicator";
import type {
  ChatSession,
  LoadingProgress,
  BackgroundDownload,
} from "../../types";
import { getModelById, AVAILABLE_MODELS } from "../../lib/models";
import { useModelCache } from "../../hooks/useModelCache";

interface ChatLayoutProps {
  chats: ChatSession[];
  activeChatId: string | null;
  activeChat: ChatSession | null;
  onNewChat: () => void;
  onSwitchChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClearChat: () => void;
  onSendMessage: (content: string) => void;
  selectedModelId: string;
  loadedModelId: string | null;
  onSelectModel: (id: string) => void;
  isModelLoaded: boolean;
  isLoadingModel: boolean;
  isGenerating: boolean;
  loadingProgress: LoadingProgress;
  error: string | null;
  onLoadModel: (modelId: string) => void;
  onCancelDownload: () => void;
  onStopGeneration: () => void;
  onBack: () => void;
  backgroundDownloads: BackgroundDownload[];
  onDismissBackgroundDownload: (modelId: string) => void;
}

/** Dropdown showing cached/downloaded models in the header. */
function ModelDropdown({
  selectedModelId,
  loadedModelId,
  isLoadingModel,
  onSelectAndLoad,
  onOpenLibrary,
}: {
  selectedModelId: string;
  loadedModelId: string | null;
  isLoadingModel: boolean;
  onSelectAndLoad: (id: string) => void;
  onOpenLibrary: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cache = useModelCache();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Get cached models from the catalog
  const cachedModels = AVAILABLE_MODELS.filter((m) => cache.isModelCached(m.id));
  const currentModel = getModelById(loadedModelId ?? selectedModelId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isLoadingModel}
        className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer disabled:opacity-50"
      >
        {loadedModelId ? (
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
        ) : (
          <Cpu className="w-3 h-3 text-gray-500 shrink-0" />
        )}
        <span className="text-gray-300 max-w-[140px] truncate">
          {currentModel?.name ?? "Select Model"}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-[#0c0c16] border border-white/[0.1] rounded-lg shadow-xl overflow-hidden z-50">
          {cachedModels.length > 0 && (
            <>
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Downloaded Models</p>
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {cachedModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectAndLoad(m.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-200 truncate">{m.name}</p>
                      <p className="text-[10px] text-gray-500">{m.provider} · {m.parameterCount}</p>
                    </div>
                    {m.id === loadedModelId && (
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          {cachedModels.length === 0 && (
            <div className="px-3 py-4 text-center">
              <Download className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">No models downloaded yet</p>
            </div>
          )}
          <div className="border-t border-white/[0.06]">
            <button
              onClick={() => {
                onOpenLibrary();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-purple-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Library className="w-3.5 h-3.5" />
              Browse Model Library
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Screen shown when no model is loaded, lets user pick and load one. */
function ModelPickerScreen({
  selectedModelId,
  isLoadingModel,
  loadingProgress,
  error,
  onLoadModel,
  onCancel,
  onOpenLibrary,
  onSelectModel,
}: {
  selectedModelId: string;
  isLoadingModel: boolean;
  loadingProgress: LoadingProgress;
  error: string | null;
  onLoadModel: (id: string) => void;
  onCancel?: () => void;
  onOpenLibrary: () => void;
  onSelectModel: (id: string) => void;
}) {
  const cache = useModelCache();
  const cachedModels = AVAILABLE_MODELS.filter((m) => cache.isModelCached(m.id));
  const selectedModel = getModelById(selectedModelId);
  const percentage = Math.round(loadingProgress.progress * 100);

  // If currently loading, show progress
  if (isLoadingModel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
          <Brain className="w-7 h-7 text-purple-400 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white mb-1">Loading Model</h2>
          <p className="text-xs text-gray-500">
            {selectedModel?.name ?? selectedModelId}
          </p>
        </div>
        <div className="w-full space-y-3">
          <div className="w-full bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="truncate mr-4 text-gray-500">{loadingProgress.text}</span>
            <span className="font-mono shrink-0 text-purple-400">{percentage}%</span>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 py-2 px-4 rounded-lg transition-all cursor-pointer text-xs"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
        </div>
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
        <Brain className="w-7 h-7 text-purple-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-1">Choose a Model</h2>
        <p className="text-xs text-gray-500">
          Select a downloaded model to start chatting, or browse the library to download one.
        </p>
      </div>

      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Cached models list */}
      {cachedModels.length > 0 ? (
        <div className="w-full space-y-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider px-1">
            Downloaded Models ({cachedModels.length})
          </p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {cachedModels.map((m) => {
              const isSelected = m.id === selectedModelId;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectModel(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-purple-500/10 border-purple-500/30"
                      : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                  }`}
                >
                  <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{m.name}</p>
                    <p className="text-[10px] text-gray-500">{m.provider} · {m.parameterCount}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onLoadModel(selectedModelId)}
            disabled={!cachedModels.some((m) => m.id === selectedModelId)}
            className="w-full py-2.5 px-4 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25 text-sm font-medium hover:bg-purple-500/25 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Load Selected Model
          </button>
        </div>
      ) : (
        <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-6 text-center">
          <Download className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400 mb-1">No models downloaded</p>
          <p className="text-xs text-gray-600">
            Visit the Model Library to download your first model
          </p>
        </div>
      )}

      <button
        onClick={onOpenLibrary}
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
      >
        <Library className="w-4 h-4" />
        Browse Model Library
      </button>
    </div>
  );
}

export function ChatLayout({
  chats,
  activeChatId,
  activeChat,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  onClearChat,
  onSendMessage,
  selectedModelId,
  loadedModelId,
  onSelectModel,
  isModelLoaded,
  isLoadingModel,
  isGenerating,
  loadingProgress,
  error,
  onLoadModel,
  onCancelDownload,
  onStopGeneration,
  onBack,
  backgroundDownloads,
  onDismissBackgroundDownload,
}: ChatLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pendingMessageRef = useRef<string | null>(null);
  const sendRef = useRef(onSendMessage);
  sendRef.current = onSendMessage;
  const model = getModelById(selectedModelId);
  const messages = activeChat?.messages ?? [];

  const supportsVision = model?.categories?.includes("vision") ?? false;

  // Flush any pending message once the active chat is ready
  useEffect(() => {
    if (activeChat && pendingMessageRef.current) {
      const msg = pendingMessageRef.current;
      pendingMessageRef.current = null;
      sendRef.current(msg);
    }
  }, [activeChat]);

  const handleSend = (content: string) => {
    if (!activeChat) {
      pendingMessageRef.current = content;
      onNewChat();
      return;
    }
    onSendMessage(content);
  };

  const handleSelectAndLoad = (modelId: string) => {
    onSelectModel(modelId);
    if (modelId !== loadedModelId) {
      onLoadModel(modelId);
    }
  };

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-[#06060a] bg-dot-grid">
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72
          md:relative md:z-auto md:shrink-0
          transition-transform duration-200
          md:transition-[width] md:duration-200 md:overflow-hidden
          ${sidebarOpen ? "translate-x-0 md:w-64" : "-translate-x-full md:translate-x-0 md:w-0"}
        `}
      >
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={() => {
            onNewChat();
            setSidebarOpen(false);
          }}
          onSwitchChat={(id) => {
            onSwitchChat(id);
            setSidebarOpen(false);
          }}
          onDeleteChat={onDeleteChat}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 relative w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-white/[0.06] relative z-10">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-300 truncate max-w-[120px] sm:max-w-[200px] ml-1">
              {activeChat?.title ?? "BrowserAI"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <OnlineIndicator />
            <ModelDropdown
              selectedModelId={selectedModelId}
              loadedModelId={loadedModelId}
              isLoadingModel={isLoadingModel}
              onSelectAndLoad={handleSelectAndLoad}
              onOpenLibrary={() => navigate("/models")}
            />
            {activeChat && messages.length > 0 && (
              <button
                onClick={onClearChat}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </header>

        {/* Content area */}
        {isLoadingModel ? (
          <ModelPickerScreen
            selectedModelId={selectedModelId}
            isLoadingModel={true}
            loadingProgress={loadingProgress}
            error={error}
            onLoadModel={onLoadModel}
            onCancel={onCancelDownload}
            onOpenLibrary={() => navigate("/models")}
            onSelectModel={onSelectModel}
          />
        ) : !isModelLoaded && messages.length === 0 ? (
          <ModelPickerScreen
            selectedModelId={selectedModelId}
            isLoadingModel={isLoadingModel}
            loadingProgress={loadingProgress}
            error={error}
            onLoadModel={onLoadModel}
            onCancel={undefined}
            onOpenLibrary={() => navigate("/models")}
            onSelectModel={onSelectModel}
          />
        ) : (
          <>
            {/* Model disconnected banner — shown when model needs reload but chat history exists */}
            {!isModelLoaded && messages.length > 0 && (
              <div
                className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3 border-b"
                style={{ backgroundColor: "#ea580c", borderBottomColor: "#c2410c" }}
              >
                <div className="flex items-center gap-2 text-white text-xs font-medium">
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                  <span>Model not loaded — reload to continue chatting</span>
                </div>
                <button
                  onClick={() => onLoadModel(selectedModelId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.35)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)")}
                >
                  <RefreshCw className="w-3 h-3" />
                  Reload
                </button>
              </div>
            )}

            {messages.length === 0 ? (
              <EmptyState modelId={selectedModelId} onSuggestion={handleSend} />
            ) : (
              <ChatWindow messages={messages} isGenerating={isGenerating} />
            )}

            <ChatInput
              onSend={handleSend}
              disabled={!isModelLoaded}
              isGenerating={isGenerating}
              onStop={onStopGeneration}
              placeholder={
                !isModelLoaded
                  ? "Reload model to send messages..."
                  : model ? `Message ${model.name}...` : "Type a message..."
              }
              supportsVision={supportsVision}
            />
          </>
        )}
      </div>

      {/* Background download indicator */}
      <BackgroundDownloadIndicator
        downloads={backgroundDownloads}
        onDismiss={onDismissBackgroundDownload}
      />
    </div>
  );
}
