# Architecture

> How BrowserLLM runs language models at near-native speed inside a browser tab.

[← Back to README](../README.md)

---

## Overview

BrowserLLM is a single-page React application that runs large language models entirely client-side. There is no backend. The inference engine runs in a Web Worker, computes on the GPU via WebGPU, and all data stays in the browser.

```
User ──► React UI (main thread)
              │
              ├── localStorage ──► Chat history, preferences
              │
              └── postMessage ──► Web Worker (MLC Engine)
                                       │
                                       ├── WebGPU ──► GPU (VRAM)
                                       │
                                       └── Cache API ──► Model weights
```

---

## Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `LandingPage` | Marketing landing page (lazy: no heavy deps loaded) |
| `/models` | `ModelsPage` | Full model catalog with hardware detection and filters |
| `/chat` | `ChatPage` | Chat interface (lazy-loaded to avoid pulling 6+ MB WASM on landing) |
| `/chat/:threadId` | `ChatPage` | Specific conversation thread |

`ChatPage` is lazy-loaded via `React.lazy()` so the landing page stays fast and mobile devices don't OOM from the WASM bundle.

---

## Core Hooks

The app is built around six custom hooks. Each is self-contained with its own state.

### `useWebLLM`

The foundational hook. Manages the MLC engine lifecycle.

**Responsibilities:**
- WebGPU capability detection (`navigator.gpu` + adapter check)
- Model loading via `CreateWebWorkerMLCEngine` (creates a Web Worker, downloads/caches weights)
- Streaming text generation (`chat.completions.create` with `stream: true`)
- Background model downloads (separate worker, cache-only — no inference)
- Download cancellation (worker termination)

**Key state:**
- `isModelLoaded` / `isLoadingModel` / `isGenerating` — lifecycle booleans
- `loadingProgress` — `{text, progress}` for download UI
- `loadedModelId` — currently active model
- `lastStats` — generation stats from last response
- `backgroundDownloads` — array of background download states

**Generation config:**
- System prompt: `"You are a helpful, friendly AI assistant running locally in the user's browser."`
- Temperature: `0.7`
- Max tokens: `1024`

### `useChatManager`

Wraps `useWebLLM` and adds multi-chat CRUD with persistence.

**Responsibilities:**
- Chat session lifecycle (create, switch, rename, delete, clear)
- Auto-titling from first message
- Streaming token updates into the active chat
- Persisting all state to `localStorage`

**Data flow for sending a message:**
1. Adds user message to the active chat
2. Auto-generates a title from the first message (if untitled)
3. Creates a placeholder assistant message
4. Calls `engine.generate(history, onToken)` — tokens stream into the placeholder
5. On completion, attaches `GenerationStats` and model name to the assistant message
6. Saves to `localStorage`

### `useModelCache`

Introspects the browser's Cache API to find which models are already downloaded.

**How it works:**
- Scans all caches with names containing `"webllm"` or `"model"`
- Extracts model IDs from cached URLs (pattern: `huggingface.co/mlc-ai/<model-id>/...`)
- Provides `isModelCached(id)` for fuzzy matching and `deleteModelCache(id)` for cleanup

### `useHardwareDetect`

Profiles WebGPU hardware capabilities. Called opt-in (not on every render).

**Detects:**
- GPU vendor, architecture, description
- Estimated VRAM and max buffer size
- Shader-f16 support (required by some quantizations)
- Compute limits (workgroup size, invocations, bind groups)
- Platform info (cores, device memory)
- Recommended tier: `low` / `medium` / `high` / `ultra`

### `useOnlineStatus`

Tracks `navigator.onLine` via event listeners. Returns `{isOnline, wasOffline}` — `wasOffline` stays true after going offline so the "back online" banner can display once.

### `useModelDownloader`

Standalone download hook used on the Models page. Separate from `useWebLLM` so the models page doesn't need to load the full inference engine.

- Creates its own Web Worker per download
- Dynamically imports `@mlc-ai/web-llm` (avoids loading 6+ MB WASM eagerly)
- Downloads model to Cache API, then disposes the engine

---

## Web Worker

`src/workers/engine.worker.ts` — a minimal file that creates a `WebWorkerMLCEngineHandler` from `@mlc-ai/web-llm` and forwards all `postMessage` events to it.

The main thread communicates via the `CreateWebWorkerMLCEngine` API, which wraps `postMessage` into a typed async interface. This keeps all model loading and token generation off the main thread.

---

## Data Storage

Everything is stored client-side. There is no database.

### localStorage

| Key | Contents |
|-----|----------|
| `browserai-chats` | JSON array of all `ChatSession` objects |
| `browserai-active-chat` | UUID of the active chat |
| `browserai-custom-models` | User-added model IDs |
| `browserai-default-model` | Default model preference |
| `browserai-selected-model` | Temporary model selection (cleared on read) |

### Cache API

Model weights are stored by WebLLM in the browser's Cache API. BrowserLLM doesn't manage this directly — it introspects the caches via `useModelCache` to display download status and provide delete functionality.

---

## Landing Page

The marketing page is composed of 10 sections, each a standalone React component with scroll-triggered Framer Motion animations:

1. **HeroSection** — Editorial typography, animated terminal demo, feature pills
2. **BentoGridSection** — 8 interactive animated feature cards in a 4-row grid
3. **HowItWorksSection** — 3-step pipeline explainer
4. **ModelsSection** — Featured model showcase with cards
5. **ComparisonSection** — BrowserLLM vs ChatGPT vs Ollama comparison table
6. **TechStackSection** — WebGPU, WebLLM, and Model Library cards
7. **DeepDiveSection** — Technical deep dives (quantization, WASM, caching, workers)
8. **FAQSection** — Accordion FAQ (also rendered as JSON-LD structured data for SEO)
9. **CtaSection** — Call to action
10. **Footer** — Links and credits

---

## Chat System

### Components

| Component | Role |
|-----------|------|
| `ChatLayout` | Main shell — sidebar + header + content area + input |
| `Sidebar` | Chat thread list with create/delete/rename |
| `ChatWindow` | Scrollable message list with auto-scroll |
| `ChatInput` | Text input with model selector and attachment button |
| `MessageBubble` | Single message — Markdown rendering for assistant messages |
| `StatsPanel` | Post-generation stats overlay (tokens/sec, context pie chart) |
| `EmptyState` | Prompt suggestions when chat is empty |
| `ModelModal` | Full-screen model selector with search and filters |

### Message Flow

```
User types ──► ChatInput ──► useChatManager.sendMessage()
                                    │
                                    ├── Add user message to state
                                    ├── Auto-title (if first message)
                                    ├── Add placeholder assistant message
                                    │
                                    └── engine.generate(history, onToken)
                                              │
                                              ├── Tokens stream into placeholder
                                              └── On complete: attach stats, persist
```

---

## PWA & Offline

### Service Worker (`public/sw.js`)

| Request Type | Strategy |
|-------------|----------|
| Navigation (HTML) | Network first, fallback to cached `/` |
| Same-origin assets | Cache first, fallback to network |
| Cross-origin / non-GET | Pass through (model weights use Cache API, not SW) |

The service worker caches the app shell for offline access. Model weights are managed separately by WebLLM via the Cache API.

### Manifest

Standard PWA manifest with `"display": "standalone"` for native-app feel when installed.

---

## Build & Deployment

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR (port 5173) |
| `npm run build` | `tsc -b` type-check → Vite production build |
| `npm run preview` | Serve the `dist/` folder locally |
| `npm run lint` | ESLint across the project |

**Build target:** `es2020, chrome87, safari14, firefox78`

**Deployment:** Vercel with SPA rewrites (`vercel.json`). Static assets get immutable 1-year cache headers. `sw.js` is set to no-cache.
