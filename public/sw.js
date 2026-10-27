const CACHE_NAME = "browserai-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          // Only evict our app shell. WebLLM weights live in "webllm/model".
          // Keep this filter in sync with isAppShellCache() in src/lib/cachePolicy.ts.
          keys
            .filter((k) => k.startsWith("browserai-") && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only cache same-origin requests. Leave Vite's dev modules alone so
  // cache-first doesn't pin a stale chat bundle during development.
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/node_modules/")
  ) {
    return;
  }

  // Navigation requests — network first, fallback to cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  // Assets — cache first, fallback to network, then a plain offline response
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(
          () =>
            new Response("Offline", {
              status: 503,
              statusText: "Offline",
            })
        );
    })
  );
});
