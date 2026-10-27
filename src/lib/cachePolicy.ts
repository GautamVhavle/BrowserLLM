/** App-shell buckets this origin's service worker is allowed to evict. */
export function isAppShellCache(name: string): boolean {
  return name.startsWith("browserai-");
}

/** Cached request belongs to this model repo, not a longer id that merely contains it. */
export function urlBelongsToModel(url: string, modelId: string): boolean {
  return url.includes(`/mlc-ai/${modelId}/`);
}

export function isModelIdCached(cachedIds: Iterable<string>, modelId: string): boolean {
  for (const id of cachedIds) {
    if (id === modelId) return true;
  }
  return false;
}
