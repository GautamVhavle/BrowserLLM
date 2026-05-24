# Contributing

> Guidelines for contributing to BrowserLLM.

[← Back to README](../README.md)

---

## Getting Started

```bash
# Fork on GitHub, then:
git clone https://github.com/<your-username>/BrowserAI.git
cd BrowserAI
npm install
npm run dev
```

The dev server starts at [localhost:5173](http://localhost:5173). You need a WebGPU-capable browser (Chrome 113+, Edge 113+, or Safari 18.2+).

---

## Project Structure

```
src/
├── main.tsx                  # Entry point — React root, service worker registration
├── App.tsx                   # Route definitions (/, /models, /chat/:threadId)
├── index.css                 # Global styles + Tailwind v4 theme
│
├── hooks/                    # Custom React hooks (core logic lives here)
│   ├── useWebLLM.ts          # Engine lifecycle — loading, inference, streaming
│   ├── useChatManager.ts     # Chat state — wraps useWebLLM + localStorage
│   ├── useModelCache.ts      # Cache API introspection for downloaded models
│   ├── useHardwareDetect.ts  # WebGPU hardware profiling
│   ├── useOnlineStatus.ts    # Online/offline tracking
│   └── useModelDownloader.ts # Standalone model download (models page)
│
├── lib/                      # Utilities and data
│   ├── modelCatalog.ts       # 153 model definitions with metadata
│   ├── models.ts             # Public re-exports from catalog
│   ├── storage.ts            # localStorage CRUD
│   ├── constants.ts          # Landing page static content
│   └── animations.ts         # Framer Motion animation variants
│
├── workers/
│   └── engine.worker.ts      # Web Worker — runs MLC engine off main thread
│
├── types/
│   └── index.ts              # Shared TypeScript interfaces
│
├── components/
│   ├── chat/                 # Chat interface components
│   ├── landing/              # Marketing landing page sections
│   └── ui/                   # Shared UI primitives
│
└── pages/
    ├── ChatPage.tsx           # Chat route (lazy-loaded)
    └── ModelsPage.tsx         # Model catalog page
```

### Where things live

- **Business logic** → `hooks/`. Each hook is self-contained with its own state.
- **Data and utilities** → `lib/`. Pure functions, no React.
- **Components** → `components/`. Organized by feature (chat, landing, ui).
- **Types** → `types/index.ts`. All shared interfaces in one file.
- **Heavy computation** → `workers/`. Runs off the main thread.

---

## Code Conventions

### TypeScript

- Strict mode enabled
- No `any` unless absolutely necessary (and explain why in a comment)
- Prefer interfaces over type aliases for object shapes
- All shared types go in `src/types/index.ts`

### React

- Functional components only — no class components
- Custom hooks for all stateful logic
- `useCallback` and `useMemo` where dependencies are non-trivial
- Lazy-load heavy routes (`React.lazy`)

### Styling

- **Tailwind CSS v4** — utility classes only, no CSS modules
- Custom theme tokens defined in `src/index.css` under `@theme`
- Dark theme by default (background: `#06060a`)
- Framer Motion for all animations — variants defined in `lib/animations.ts`
- `lucide-react` for all icons

### File naming

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` (prefixed with `use`)
- Utils/data: `camelCase.ts`
- Barrel exports: `index.ts` in each component directory

### Imports

- Absolute imports from `src/` (configured in tsconfig)
- Barrel exports for component directories
- Dynamic `import()` for heavy dependencies on non-critical paths

---

## Making Changes

### Adding a new feature

1. **Hook first** — If the feature has state, create a hook in `src/hooks/`
2. **Types** — Add interfaces to `src/types/index.ts`
3. **Component** — Build the UI in the appropriate `components/` subdirectory
4. **Export** — Add to the barrel `index.ts` if the directory has one

### Adding a new model

See the [Models documentation](models.md#adding-a-model-to-the-catalog).

### Adding a landing page section

1. Create `src/components/landing/MySectionName.tsx`
2. Export from `src/components/landing/index.ts`
3. Add to the composition in `src/components/landing/Landing.tsx`
4. Use `SectionHeader` component for consistent section headings
5. Use animation variants from `lib/animations.ts` with `whileInView`

### Modifying chat behavior

The chat data flow is: `ChatInput` → `useChatManager.sendMessage()` → `useWebLLM.generate()` → Web Worker → GPU. Most changes to chat behavior go in `useChatManager.ts`. Engine-level changes go in `useWebLLM.ts`.

---

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add model comparison view
fix: handle WebGPU adapter not found on mobile
docs: update architecture diagram
style: adjust sidebar hover states
refactor: extract model tier calculation
perf: lazy-load model catalog on models page
chore: update web-llm to 0.2.84
```

---

## Pull Requests

1. **One feature per PR** — keep changes focused
2. **Title** — use the conventional commit format
3. **Description** — explain *what* and *why*, not just *how*
4. **Test** — verify the build passes (`npm run build`) and lint is clean (`npm run lint`)
5. **Screenshots** — include screenshots for any UI changes

### PR checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` has no new warnings
- [ ] Tested in Chrome (WebGPU) with at least one model loaded
- [ ] No `console.log` left behind
- [ ] New types added to `src/types/index.ts` if applicable
- [ ] Barrel exports updated if new components added

---

## Key Things to Know

### The app has no backend

Every feature must work client-side. No API calls to custom servers. Model weights come from HuggingFace CDN and are cached in the browser.

### WebGPU is required

The app gracefully handles browsers without WebGPU (shows an error message), but all inference features require it. Always test in a WebGPU-capable browser.

### The MLC engine runs in a Web Worker

`engine.worker.ts` is the bridge. The main thread communicates via `CreateWebWorkerMLCEngine` which wraps `postMessage`. Never try to run inference on the main thread.

### Model weights are large

Even quantized, models range from ~300 MB to 5+ GB. The app downloads them once and caches via the Cache API. Keep this in mind when testing — you don't need to re-download models between page reloads.

### localStorage has limits

Chat history is stored in `localStorage` (~5-10 MB limit depending on browser). Very long conversations can hit this limit. This is a known constraint.

---

## Need Help?

- Check the [Architecture docs](architecture.md) to understand how the pieces fit together
- Check the [Models docs](models.md) for model catalog specifics
- Open an issue on GitHub for bugs or feature requests
