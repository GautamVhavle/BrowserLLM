/**
 * Core WebLLM hook, manages the MLC engine lifecycle.
 *
 * Responsibilities:
 * - WebGPU capability detection
 * - Model loading (with cancel support)
 * - Streaming text generation with usage stats
 * - Background model downloads (download while using another model)
 *
 * The engine runs inside a Web Worker (`engine.worker.ts`) so the main
 * thread stays responsive during inference.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import {
  CreateWebWorkerMLCEngine,
  type WebWorkerMLCEngine,
  type ChatCompletionMessageParam,
} from "@mlc-ai/web-llm";
import type { Message, LoadingProgress, GenerationStats, BackgroundDownload } from "../types";

const SESSION_KEY = "browserai-loaded-model";

export function useWebLLM() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    text: "",
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);
  const [lastStats, setLastStats] = useState<GenerationStats | null>(null);
  const [backgroundDownloads, setBackgroundDownloads] = useState<BackgroundDownload[]>([]);
  const engineRef = useRef<WebWorkerMLCEngine | null>(null);
  const abortRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);
  const loadingModelIdRef = useRef<string | null>(null);

  /** Verify that the browser supports WebGPU and a GPU adapter is available. */
  const checkWebGPU = useCallback(async (): Promise<boolean> => {
    if (!("gpu" in navigator)) {
      setError(
        "WebGPU is not supported in this browser. Please use Chrome 113+, Edge 113+, or Safari 18.2+."
      );
      return false;
    }
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) {
        setError(
          "No WebGPU adapter found. Your GPU may not be supported."
        );
        return false;
      }
      return true;
    } catch {
      setError("Failed to initialize WebGPU.");
      return false;
    }
  }, []);

  /** Cancel an in-progress foreground model download by terminating its worker. */
  const cancelDownload = useCallback(async () => {
    if (workerRef.current && isLoadingModel) {
      const modelId = loadingModelIdRef.current;
      workerRef.current.terminate();
      workerRef.current = null;
      engineRef.current = null;
      setIsLoadingModel(false);
      setLoadingProgress({ text: "", progress: 0 });
      setError(null);

      // Clean up partial cache entries for the cancelled model
      if (modelId) {
        try {
          const names = await caches.keys();
          for (const name of names) {
            if (name.includes("webllm") || name.includes("model")) {
              const cache = await caches.open(name);
              const keys = await cache.keys();
              for (const req of keys) {
                if (req.url.includes(modelId)) {
                  await cache.delete(req);
                }
              }
            }
          }
        } catch {
          // Cache cleanup failed, not critical
        }
      }
    }
  }, [isLoadingModel]);

  /**
   * Load (or switch to) a model in the foreground.
   * Creates a new Web Worker, downloads/caches the model weights,
   * and initializes the MLC engine for inference.
   */
  const loadModel = useCallback(
    async (modelId: string) => {
      if (loadedModelId === modelId && isModelLoaded) return;

      setError(null);
      const gpuOk = await checkWebGPU();
      if (!gpuOk) return;

      // Cancel any existing download
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      loadingModelIdRef.current = modelId;
      setIsLoadingModel(true);
      setIsModelLoaded(false);
      setLoadedModelId(null);
      setLoadingProgress({ text: "Starting model download...", progress: 0 });

      try {
        const worker = new Worker(
          new URL("../workers/engine.worker.ts", import.meta.url),
          { type: "module" }
        );
        workerRef.current = worker;

        // Gemma 3 models use sliding window attention — WebLLM requires only
        // one of context_window_size / sliding_window_size to be positive.
        const needsSlidingWindowFix = modelId.toLowerCase().includes("gemma3");
        const engine = await CreateWebWorkerMLCEngine(
          worker,
          modelId,
          {
            initProgressCallback: (report) => {
              setLoadingProgress({
                text: report.text,
                progress: report.progress,
              });
            },
          },
          needsSlidingWindowFix ? { context_window_size: -1, attention_sink_size: 0 } : undefined,
        );

        engineRef.current = engine;
        setLoadedModelId(modelId);
        setIsModelLoaded(true);
        // Persist so we can auto-reload from cache after page refresh
        try { sessionStorage.setItem(SESSION_KEY, modelId); } catch {}
      } catch (err) {
        // Don't show error if worker was terminated (cancelled)
        if (workerRef.current) {
          setError(
            `Failed to load model: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      } finally {
        setIsLoadingModel(false);
      }
    },
    [checkWebGPU, loadedModelId, isModelLoaded]
  );

  // Auto-reload model from cache after page refresh / tab restore
  const autoLoadFired = useRef(false);
  useEffect(() => {
    if (autoLoadFired.current || isModelLoaded || isLoadingModel) return;
    autoLoadFired.current = true;
    try {
      const lastModel = sessionStorage.getItem(SESSION_KEY);
      if (lastModel) {
        loadModel(lastModel);
      }
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Download a model in the background while the user chats with the current model.
   * The downloaded model is cached via the Cache API and can be loaded instantly later.
   * The background engine is disposed after download completes.
   */
  const startBackgroundDownload = useCallback(
    async (modelId: string, modelName: string) => {
      // Don't start if already downloading this model
      if (backgroundDownloads.some((d) => d.modelId === modelId && d.status === "downloading")) return;

      const gpuOk = await checkWebGPU();
      if (!gpuOk) return;

      const dl: BackgroundDownload = {
        modelId,
        modelName,
        progress: 0,
        text: "Starting download...",
        status: "downloading",
      };
      setBackgroundDownloads((prev) => [...prev, dl]);

      try {
        const bgWorker = new Worker(
          new URL("../workers/engine.worker.ts", import.meta.url),
          { type: "module" }
        );

        // Just download/cache the model, then dispose
        const bgNeedsSlidingWindowFix = modelId.toLowerCase().includes("gemma3");
        const bgEngine = await CreateWebWorkerMLCEngine(
          bgWorker,
          modelId,
          {
            initProgressCallback: (report) => {
              setBackgroundDownloads((prev) =>
                prev.map((d) =>
                  d.modelId === modelId
                    ? { ...d, progress: report.progress, text: report.text }
                    : d
                )
              );
            },
          },
          bgNeedsSlidingWindowFix ? { context_window_size: -1, attention_sink_size: 0 } : undefined,
        );

        // Model is loaded, terminate the bg engine since we just wanted to cache it
        bgEngine.unload();
        bgWorker.terminate();

        setBackgroundDownloads((prev) =>
          prev.map((d) =>
            d.modelId === modelId ? { ...d, status: "completed", progress: 1 } : d
          )
        );
      } catch (err) {
        setBackgroundDownloads((prev) =>
          prev.map((d) =>
            d.modelId === modelId
              ? { ...d, status: "error", error: err instanceof Error ? err.message : String(err) }
              : d
          )
        );
      }
    },
    [backgroundDownloads, checkWebGPU]
  );

  const cancelBackgroundDownload = useCallback((modelId: string) => {
    setBackgroundDownloads((prev) =>
      prev.map((d) =>
        d.modelId === modelId ? { ...d, status: "cancelled" } : d
      )
    );
  }, []);

  const dismissBackgroundDownload = useCallback((modelId: string) => {
    setBackgroundDownloads((prev) => prev.filter((d) => d.modelId !== modelId));
  }, []);

  /**
   * Run streaming inference against the loaded model.
   * Calls `onToken` with the accumulated reply text after each token.
   * Returns the final complete response and generation stats.
   */
  const generate = useCallback(
    async (
      history: Message[],
      onToken: (fullText: string) => void
    ): Promise<{ text: string; stats: GenerationStats | null }> => {
      if (!engineRef.current) throw new Error("Model not loaded");

      abortRef.current = false;
      setIsGenerating(true);
      setLastStats(null);

      const startTime = performance.now();
      let tokenCount = 0;

      try {
        const chatHistory: ChatCompletionMessageParam[] = [
          {
            role: "system",
            content:
              "You are a helpful, friendly AI assistant running locally in the user's browser. Keep responses concise and helpful.",
          },
          ...history.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        const chunks = await engineRef.current.chat.completions.create({
          messages: chatHistory,
          stream: true,
          stream_options: { include_usage: true },
          temperature: 0.7,
          max_tokens: 1024,
        });

        let fullReply = "";
        let usageInfo: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null = null;

        for await (const chunk of chunks) {
          if (abortRef.current) break;
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            tokenCount++;
            fullReply += delta;
            onToken(fullReply);
          }
          if (chunk.usage) {
            usageInfo = chunk.usage;
          }
        }

        if (!fullReply && !abortRef.current) {
          throw new Error(
            "Model returned an empty response. Try reloading the model."
          );
        }

        const elapsed = performance.now() - startTime;
        const promptTokens = usageInfo?.prompt_tokens ?? 0;
        const completionTokens = usageInfo?.completion_tokens ?? tokenCount;
        const totalTokens = usageInfo?.total_tokens ?? (promptTokens + completionTokens);

        // Get context window from the loaded model config (default 4096)
        const contextTotal = 4096;

        const stats: GenerationStats = {
          tokensGenerated: completionTokens,
          totalTokens,
          promptTokens,
          tokensPerSecond: elapsed > 0 ? (completionTokens / (elapsed / 1000)) : 0,
          contextUsed: totalTokens,
          contextTotal,
          systemPromptTokens: 0,
          generationTimeMs: elapsed,
        };

        setLastStats(stats);

        return { text: fullReply, stats };
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
  }, []);

  return {
    isModelLoaded,
    isLoadingModel,
    isGenerating,
    loadingProgress,
    error,
    loadedModelId,
    loadModel,
    cancelDownload,
    generate,
    stopGeneration,
    checkWebGPU,
    lastStats,
    backgroundDownloads,
    startBackgroundDownload,
    cancelBackgroundDownload,
    dismissBackgroundDownload,
  };
}
