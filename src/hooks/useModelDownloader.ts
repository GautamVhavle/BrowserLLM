/**
 * Standalone hook for downloading models on the Models page.
 *
 * Uses CreateWebWorkerMLCEngine to download model weights into the
 * browser Cache API, then disposes the engine. The model can be
 * loaded instantly later from cache.
 *
 * This is independent of the chat engine — it doesn't interfere with
 * any model that's currently loaded for inference.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import type { BackgroundDownload } from "../types";

export type DownloadResult = "completed" | "failed" | "cancelled" | "busy";

export function useModelDownloader() {
  const [downloads, setDownloads] = useState<BackgroundDownload[]>([]);
  const workersRef = useRef<Map<string, Worker>>(new Map());

  const isDownloading = useCallback(
    (modelId: string) =>
      downloads.some((d) => d.modelId === modelId && d.status === "downloading"),
    [downloads]
  );

  const getDownload = useCallback(
    (modelId: string) => downloads.find((d) => d.modelId === modelId),
    [downloads]
  );

  const startDownload = useCallback(
    async (modelId: string, modelName: string): Promise<DownloadResult> => {
      if (workersRef.current.has(modelId)) return "busy";
      // One engine at a time. A second WebLLM worker allocates another full model.
      if (workersRef.current.size > 0) return "busy";

      // Check WebGPU
      if (!("gpu" in navigator)) {
        setDownloads((prev) => [
          ...prev,
          {
            modelId,
            modelName,
            progress: 0,
            text: "WebGPU not supported",
            status: "error",
            error: "WebGPU is not supported in this browser.",
          },
        ]);
        return "failed";
      }

      setDownloads((prev) => {
        // Remove any previous entry for this model
        const filtered = prev.filter((d) => d.modelId !== modelId);
        return [
          ...filtered,
          {
            modelId,
            modelName,
            progress: 0,
            text: "Starting download...",
            status: "downloading",
          },
        ];
      });

      let worker: Worker | null = null;
      let tracked = false;
      try {
        worker = new Worker(
          new URL("../workers/engine.worker.ts", import.meta.url),
          { type: "module" }
        );
        workersRef.current.set(modelId, worker);
        tracked = true;

        // Dynamic import to avoid loading web-llm eagerly on the models page
        const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");

        const needsSlidingWindowFix = modelId.toLowerCase().includes("gemma3");
        const engine = await CreateWebWorkerMLCEngine(
          worker,
          modelId,
          {
            initProgressCallback: (report) => {
              setDownloads((prev) =>
                prev.map((d) =>
                  d.modelId === modelId
                    ? { ...d, progress: report.progress, text: report.text }
                    : d
                )
              );
            },
          },
          needsSlidingWindowFix ? { context_window_size: -1, attention_sink_size: 0 } : undefined,
        );

        await engine.unload();
        if (workersRef.current.get(modelId) !== worker) {
          worker.terminate();
          return "cancelled";
        }
        worker.terminate();
        workersRef.current.delete(modelId);

        setDownloads((prev) =>
          prev.map((d) =>
            d.modelId === modelId
              ? { ...d, status: "completed", progress: 1, text: "Download complete" }
              : d
          )
        );
        return "completed";
      } catch (err) {
        const cancelled = tracked && workersRef.current.get(modelId) !== worker;
        if (worker) workersRef.current.delete(modelId);
        if (cancelled) return "cancelled";
        setDownloads((prev) =>
          prev.map((d) =>
            d.modelId === modelId
              ? {
                  ...d,
                  status: "error",
                  error: err instanceof Error ? err.message : String(err),
                  text: "Download failed",
                }
              : d
          )
        );
        return "failed";
      }
    },
    []
  );

  useEffect(() => {
    const workers = workersRef.current;
    return () => {
      for (const worker of workers.values()) worker.terminate();
      workers.clear();
    };
  }, []);

  const cancelDownload = useCallback((modelId: string) => {
    const worker = workersRef.current.get(modelId);
    if (worker) {
      worker.terminate();
      workersRef.current.delete(modelId);
    }
    setDownloads((prev) =>
      prev.map((d) =>
        d.modelId === modelId
          ? { ...d, status: "cancelled", text: "Download cancelled" }
          : d
      )
    );
  }, []);

  const dismissDownload = useCallback((modelId: string) => {
    const worker = workersRef.current.get(modelId);
    if (worker) {
      worker.terminate();
      workersRef.current.delete(modelId);
    }
    setDownloads((prev) => prev.filter((d) => d.modelId !== modelId));
  }, []);

  return {
    downloads,
    isDownloading,
    getDownload,
    startDownload,
    cancelDownload,
    dismissDownload,
  };
}
