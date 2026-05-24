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
      // Group cached URLs by model ID
      const modelUrls = new Map<string, Set<string>>();

      for (const name of cacheNames) {
        if (name.includes("webllm") || name.includes("model")) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          for (const req of keys) {
            const url = req.url;
            const match = url.match(/mlc-ai\/([^/]+)/);
            if (match) {
              const id = match[1];
              if (!modelUrls.has(id)) modelUrls.set(id, new Set());
              modelUrls.get(id)!.add(url);
            }
          }
        }
      }

      // Verify completeness: parse the ndarray-cache.json manifest for each model
      // and check that every listed shard file is actually cached.
      const modelIds = new Set<string>();
      for (const [id, urls] of modelUrls) {
        const manifestUrl = [...urls].find((u) => u.endsWith("ndarray-cache.json"));
        if (!manifestUrl) continue; // No manifest = definitely incomplete

        try {
          // Read the manifest from cache
          const manifestResponse = await caches.match(manifestUrl);
          if (!manifestResponse) continue;
          const manifest = await manifestResponse.json();

          // The manifest has a "records" array, each with a "dataPath" field
          // listing the shard filenames (e.g. "params_shard_0.bin")
          const records: { dataPath: string }[] = manifest?.records ?? [];
          if (records.length === 0) continue;

          // Get unique shard filenames expected
          const expectedShards = new Set(records.map((r) => r.dataPath));
          const baseUrl = manifestUrl.replace(/ndarray-cache\.json$/, "");

          // Check every expected shard exists in cache
          let complete = true;
          for (const shard of expectedShards) {
            const shardUrl = baseUrl + shard;
            if (!urls.has(shardUrl)) {
              complete = false;
              break;
            }
          }

          if (complete) {
            modelIds.add(id);
          }
        } catch {
          // Failed to parse manifest, skip this model
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
