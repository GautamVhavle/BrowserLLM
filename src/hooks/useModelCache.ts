/**
 * Introspects the browser's Cache API to detect which WebLLM models
 * have already been downloaded. Also provides `deleteModelCache` for
 * freeing disk space.
 */
import { useState, useCallback, useEffect } from "react";

export function useModelCache() {
  const [cachedModels, setCachedModels] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const detectCachedModels = useCallback(async () => {
    setLoading(true);
    try {
      const cacheNames = await caches.keys();
      const modelIds = new Set<string>();

      for (const name of cacheNames) {
        if (name.includes("webllm") || name.includes("model")) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          for (const req of keys) {
            const url = req.url;
            // Extract model ID from cache URL patterns
            // WebLLM caches at URLs like: https://huggingface.co/mlc-ai/<model-id>/...
            const match = url.match(/mlc-ai\/([^/]+)/);
            if (match) {
              modelIds.add(match[1]);
            }
          }
        }
      }

      setCachedModels(modelIds);
    } catch {
      // Cache API not available
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteModelCache = useCallback(
    async (modelId: string) => {
      try {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
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
        setCachedModels((prev) => {
          const next = new Set(prev);
          next.delete(modelId);
          return next;
        });
      } catch {
        // Failed to delete
      }
    },
    []
  );

  const isModelCached = useCallback(
    (modelId: string): boolean => {
      // Check if any cached model name contains a significant part of the model ID
      for (const cached of cachedModels) {
        if (modelId.includes(cached) || cached.includes(modelId)) {
          return true;
        }
      }
      return false;
    },
    [cachedModels]
  );

  useEffect(() => {
    detectCachedModels();
  }, [detectCachedModels]);

  return {
    cachedModels,
    loading,
    isModelCached,
    deleteModelCache,
    refresh: detectCachedModels,
  };
}
