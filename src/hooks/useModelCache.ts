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

      // Verify completeness by parsing the weight manifest and checking all shards exist.
      // WebLLM uses either "ndarray-cache.json" or "tensor-cache.json" as the manifest.
      const MANIFEST_NAMES = ["ndarray-cache.json", "tensor-cache.json"];
      const modelIds = new Set<string>();

      for (const [id, urls] of modelUrls) {
        // Find the manifest URL (try both known filenames)
        const manifestUrl = [...urls].find((u) =>
          MANIFEST_NAMES.some((m) => u.endsWith(m))
        );

        if (!manifestUrl) {
          // No manifest found — fall back to file count heuristic.
          // A complete model needs config + tokenizer + wasm + at least 1 shard.
          if (urls.size >= 4) modelIds.add(id);
          continue;
        }

        try {
          const manifestResponse = await caches.match(manifestUrl);
          if (!manifestResponse) {
            if (urls.size >= 4) modelIds.add(id);
            continue;
          }
          const manifest = await manifestResponse.json();

          // Manifest can be a top-level array or { records: [...] }
          const shardList: { dataPath?: string }[] = Array.isArray(manifest)
            ? manifest
            : Array.isArray(manifest?.records)
            ? manifest.records
            : [];

          const expectedShards = new Set(
            shardList.map((r) => r.dataPath).filter(Boolean) as string[]
          );

          if (expectedShards.size === 0) {
            // Can't extract shard list — fall back to file count
            if (urls.size >= 4) modelIds.add(id);
            continue;
          }

          // Derive base URL from manifest URL
          const manifestFilename = MANIFEST_NAMES.find((m) => manifestUrl.endsWith(m))!;
          const baseUrl = manifestUrl.slice(0, -manifestFilename.length);

          // Check every expected shard exists in cache
          let complete = true;
          for (const shard of expectedShards) {
            if (!urls.has(baseUrl + shard)) {
              complete = false;
              break;
            }
          }

          if (complete) {
            modelIds.add(id);
          }
        } catch {
          // Manifest parse failed — fall back to file count
          if (urls.size >= 4) modelIds.add(id);
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
