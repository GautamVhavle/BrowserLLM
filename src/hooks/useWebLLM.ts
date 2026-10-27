/**
 * Core WebLLM hook, manages the MLC engine lifecycle.
 *
 * One foreground worker at a time. Background downloads are refused while
 * that worker exists: WebLLM has no cache-only API, so a second engine
 * would allocate another full model on the GPU.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import {
  CreateWebWorkerMLCEngine,
  type WebWorkerMLCEngine,
  type ChatCompletionMessageParam,
} from "@mlc-ai/web-llm";
import type { ConversationMemory, Message, LoadingProgress, GenerationStats, BackgroundDownload } from "../types";
import { getModelById, isKnownModelId } from "../lib/models";
import { readSession, removeSession, writeSession } from "../lib/storage";
import {
  completionBudget,
  estimateTokens,
  planContext,
  summaryRequest,
  systemContent,
  takeSummaryChunk,
} from "../lib/promptHistory";
import { urlBelongsToModel } from "../lib/cachePolicy";

const SESSION_KEY = "browserai-loaded-model";

const SUMMARY_INSTRUCTION =
  "Condense the conversation into a memory the assistant can use later. Keep names, decisions, and goals. At most 120 words.";

function slidingWindowOverride(modelId: string) {
  return modelId.toLowerCase().includes("gemma3")
    ? { context_window_size: -1, attention_sink_size: 0 }
    : undefined;
}

export function useWebLLM() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(() => {
    const remembered = readSession(SESSION_KEY);
    return Boolean(remembered && isKnownModelId(remembered));
  });
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
  const loadedModelIdRef = useRef<string | null>(null);
  const loadGen = useRef(0);
  const bgWorkersRef = useRef<Map<string, Worker>>(new Map());

  const checkWebGPU = useCallback(async (): Promise<boolean> => {
    if (!("gpu" in navigator)) {
      setError(
        "WebGPU is not supported in this browser. Please use Chrome 113+, Edge 113+, or Safari 18.2+."
      );
      return false;
    }
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        setError("No WebGPU adapter found. Your GPU may not be supported.");
        return false;
      }
      return true;
    } catch {
      setError("Failed to initialize WebGPU.");
      return false;
    }
  }, []);

  const stopBackgroundWorkers = useCallback(() => {
    for (const worker of bgWorkersRef.current.values()) worker.terminate();
    bgWorkersRef.current.clear();
  }, []);

  const cancelDownload = useCallback(async () => {
    if (!workerRef.current && !isLoadingModel) return;
    loadGen.current += 1;
    const modelId = loadingModelIdRef.current;
    workerRef.current?.terminate();
    workerRef.current = null;
    engineRef.current = null;
    loadingModelIdRef.current = null;
    setIsLoadingModel(false);
    setLoadingProgress({ text: "", progress: 0 });
    setError(null);

    if (!modelId) return;
    try {
      const names = await caches.keys();
      for (const name of names) {
        if (!name.includes("webllm") && !name.includes("model")) continue;
        const cache = await caches.open(name);
        const keys = await cache.keys();
        for (const req of keys) {
          if (urlBelongsToModel(req.url, modelId)) await cache.delete(req);
        }
      }
    } catch {
      // Partial cache cleanup is best-effort.
    }
  }, [isLoadingModel]);

  const loadModel = useCallback(
    async (modelId: string) => {
      if (loadedModelIdRef.current === modelId && engineRef.current) return;

      setError(null);
      const gpuOk = await checkWebGPU();
      if (!gpuOk) {
        setIsLoadingModel(false);
        return;
      }

      const gen = ++loadGen.current;
      stopBackgroundWorkers();
      workerRef.current?.terminate();
      workerRef.current = null;
      engineRef.current = null;
      loadedModelIdRef.current = null;

      loadingModelIdRef.current = modelId;
      setIsLoadingModel(true);
      setIsModelLoaded(false);
      setLoadedModelId(null);
      setLoadingProgress({ text: "Starting model download...", progress: 0 });

      let worker: Worker | null = null;
      try {
        worker = new Worker(
          new URL("../workers/engine.worker.ts", import.meta.url),
          { type: "module" }
        );
        if (gen !== loadGen.current) {
          worker.terminate();
          return;
        }
        workerRef.current = worker;

        const engine = await CreateWebWorkerMLCEngine(
          worker,
          modelId,
          {
            initProgressCallback: (report) => {
              if (gen !== loadGen.current) return;
              setLoadingProgress({
                text: report.text,
                progress: report.progress,
              });
            },
          },
          slidingWindowOverride(modelId),
        );

        if (gen !== loadGen.current) {
          worker.terminate();
          void engine.unload().catch(() => {});
          return;
        }

        engineRef.current = engine;
        loadedModelIdRef.current = modelId;
        setLoadedModelId(modelId);
        setIsModelLoaded(true);
        writeSession(SESSION_KEY, modelId);
      } catch (err) {
        if (gen !== loadGen.current) return;
        if (worker && workerRef.current === worker) {
          workerRef.current = null;
          engineRef.current = null;
        }
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("Cannot find model record") || message.includes("ModelNotFound")) {
          removeSession(SESSION_KEY);
        }
        setError(`Failed to load model: ${message}`);
      } finally {
        if (gen === loadGen.current) setIsLoadingModel(false);
      }
    },
    [checkWebGPU, stopBackgroundWorkers]
  );

  const autoLoadFired = useRef(false);
  useEffect(() => {
    if (autoLoadFired.current) return;
    autoLoadFired.current = true;
    const lastModel = readSession(SESSION_KEY);
    if (lastModel && isKnownModelId(lastModel)) {
      void loadModel(lastModel);
    } else {
      if (lastModel) removeSession(SESSION_KEY);
      setIsLoadingModel(false);
    }
  }, [loadModel]);

  useEffect(() => {
    return () => {
      loadGen.current += 1;
      workerRef.current?.terminate();
      workerRef.current = null;
      engineRef.current = null;
      stopBackgroundWorkers();
    };
  }, [stopBackgroundWorkers]);

  const startBackgroundDownload = useCallback(
    async (modelId: string, modelName: string) => {
      if (backgroundDownloads.some((d) => d.modelId === modelId && d.status === "downloading")) return;

      // shortcut: WebLLM initializes a full engine to fill the cache. A second
      // engine next to a loaded model OOMs the tab, so this waits until the
      // foreground worker is gone.
      if (workerRef.current || engineRef.current) {
        setBackgroundDownloads((prev) => [
          ...prev.filter((d) => d.modelId !== modelId),
          {
            modelId,
            modelName,
            progress: 0,
            text: "A model is already loaded",
            status: "error",
            error: "Unload the current model before downloading another.",
          },
        ]);
        return;
      }
      if (bgWorkersRef.current.size > 0) return;

      const gpuOk = await checkWebGPU();
      if (!gpuOk) return;

      const dl: BackgroundDownload = {
        modelId,
        modelName,
        progress: 0,
        text: "Starting download...",
        status: "downloading",
      };
      setBackgroundDownloads((prev) => [...prev.filter((d) => d.modelId !== modelId), dl]);

      const bgWorker = new Worker(
        new URL("../workers/engine.worker.ts", import.meta.url),
        { type: "module" }
      );
      bgWorkersRef.current.set(modelId, bgWorker);

      try {
        const bgEngine = await CreateWebWorkerMLCEngine(
          bgWorker,
          modelId,
          {
            initProgressCallback: (report) => {
              if (bgWorkersRef.current.get(modelId) !== bgWorker) return;
              setBackgroundDownloads((prev) =>
                prev.map((d) =>
                  d.modelId === modelId
                    ? { ...d, progress: report.progress, text: report.text }
                    : d
                )
              );
            },
          },
          slidingWindowOverride(modelId),
        );

        if (bgWorkersRef.current.get(modelId) !== bgWorker) {
          bgWorker.terminate();
          void bgEngine.unload().catch(() => {});
          return;
        }

        await bgEngine.unload();
        bgWorker.terminate();
        bgWorkersRef.current.delete(modelId);

        setBackgroundDownloads((prev) =>
          prev.map((d) =>
            d.modelId === modelId ? { ...d, status: "completed", progress: 1 } : d
          )
        );
      } catch (err) {
        const cancelled = bgWorkersRef.current.get(modelId) !== bgWorker;
        bgWorkersRef.current.delete(modelId);
        if (cancelled) return;
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
    const worker = bgWorkersRef.current.get(modelId);
    bgWorkersRef.current.delete(modelId);
    worker?.terminate();
    setBackgroundDownloads((prev) =>
      prev.map((d) =>
        d.modelId === modelId ? { ...d, status: "cancelled" } : d
      )
    );
  }, []);

  const dismissBackgroundDownload = useCallback((modelId: string) => {
    const worker = bgWorkersRef.current.get(modelId);
    bgWorkersRef.current.delete(modelId);
    worker?.terminate();
    setBackgroundDownloads((prev) => prev.filter((d) => d.modelId !== modelId));
  }, []);

  const complete = useCallback(
    async (
      messages: ChatCompletionMessageParam[],
      maxTokens: number,
      temperature: number,
      includeUsage: boolean,
      onDelta?: (fullText: string) => void,
    ): Promise<{ text: string; usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null; tokens: number }> => {
      if (!engineRef.current) throw new Error("Model not loaded");
      const chunks = await engineRef.current.chat.completions.create({
        messages,
        stream: true,
        ...(includeUsage ? { stream_options: { include_usage: true } } : {}),
        temperature,
        max_tokens: maxTokens,
      });
      let text = "";
      let tokens = 0;
      let usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null = null;
      try {
        for await (const chunk of chunks) {
          if (abortRef.current) break;
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            tokens++;
            text += delta;
            onDelta?.(text);
          }
          if (chunk.usage) usage = chunk.usage;
        }
      } catch (err) {
        if (!abortRef.current) throw err;
      }
      return { text, usage, tokens };
    },
    [],
  );

  const generate = useCallback(
    async (
      history: Message[],
      onToken: (fullText: string) => void,
      memory: ConversationMemory | null = null,
    ): Promise<{ text: string; stats: GenerationStats | null; memory: ConversationMemory | null }> => {
      if (!engineRef.current) throw new Error("Model not loaded");

      abortRef.current = false;
      setIsGenerating(true);
      setLastStats(null);

      const startTime = performance.now();
      const modelId = loadedModelIdRef.current ?? "";
      const contextTotal = getModelById(modelId)?.contextWindow || 4096;
      const maxTokens = completionBudget(contextTotal);
      let summary = memory?.summary ?? "";
      let covered = memory?.coveredCount ?? 0;

      const remembered = (): ConversationMemory | null =>
        summary && covered > 0 ? { summary, coveredCount: covered } : null;

      try {
        let plan = planContext(
          history,
          covered,
          contextTotal,
          maxTokens + estimateTokens(systemContent(summary || null)),
        );
        let folds = 0;
        while (plan.needsFold && folds < 8) {
          if (abortRef.current) return { text: "", stats: null, memory: remembered() };
          const chunk = takeSummaryChunk(
            history,
            covered,
            plan.foldCount,
            Math.max(256, contextTotal - maxTokens - 200),
          );
          if (chunk.messages.length === 0 || chunk.next <= covered) break;
          const written = await complete(
            [
              { role: "system", content: SUMMARY_INSTRUCTION },
              { role: "user", content: summaryRequest(summary, chunk.messages) },
            ],
            220,
            0.2,
            false,
          );
          if (abortRef.current) return { text: "", stats: null, memory: remembered() };
          summary = written.text.trim() || summary || "Earlier turns were shortened to fit the context window.";
          covered = chunk.next;
          folds++;
          plan = planContext(
            history,
            covered,
            contextTotal,
            maxTokens + estimateTokens(systemContent(summary)),
          );
        }

        const prompt = systemContent(summary || null);
        const chatHistory: ChatCompletionMessageParam[] = [
          { role: "system", content: prompt },
          ...plan.recent.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        const reply = await complete(chatHistory, maxTokens, 0.7, true, onToken);

        if (!reply.text && !abortRef.current) {
          throw new Error("Model returned an empty response. Try reloading the model.");
        }

        const elapsed = performance.now() - startTime;
        const promptTokens = reply.usage?.prompt_tokens ?? 0;
        const completionTokens = reply.usage?.completion_tokens ?? reply.tokens;
        const totalTokens = reply.usage?.total_tokens ?? (promptTokens + completionTokens);
        const stats: GenerationStats = {
          tokensGenerated: completionTokens,
          totalTokens,
          promptTokens,
          tokensPerSecond: elapsed > 0 ? (completionTokens / (elapsed / 1000)) : 0,
          contextUsed: totalTokens,
          contextTotal,
          systemPromptTokens: estimateTokens(prompt),
          generationTimeMs: elapsed,
        };

        if (!abortRef.current) setLastStats(stats);
        return {
          text: reply.text,
          stats: abortRef.current ? null : stats,
          memory: remembered(),
        };
      } finally {
        setIsGenerating(false);
      }
    },
    [complete]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    const engine = engineRef.current;
    if (!engine) return;
    engine.interruptGenerate();
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
