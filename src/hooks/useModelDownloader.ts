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
import { useState, useCallback, useRef } from "react";
import type { BackgroundDownload } from "../types";

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
    async (modelId: string, modelName: string) => {
      // Don't start duplicate
      if (workersRef.current.has(modelId)) return;

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
        return;
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

      try {
        const worker = new Worker(
          new URL("../workers/engine.worker.ts", import.meta.url),
          { type: "module" }
        );
        workersRef.current.set(modelId, worker);

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

        // Model cached — dispose the engine
        engine.unload();
        worker.terminate();
        workersRef.current.delete(modelId);

        setDownloads((prev) =>
          prev.map((d) =>
            d.modelId === modelId
              ? { ...d, status: "completed", progress: 1, text: "Download complete" }
              : d
          )
        );
      } catch (err) {
        workersRef.current.delete(modelId);
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
      }
    },
    []
  );

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
