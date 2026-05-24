# Contributing to BrowserLLM

Thank you for your interest in contributing. BrowserLLM is a fully client-side app — there are no servers to worry about, which makes it easy to get running locally in minutes.

## Getting Started

```bash
git clone https://github.com/GautamVhavle/BrowserLLM.git
cd BrowserLLM
npm install
npm run dev
```

Open `http://localhost:5173`. You need a **WebGPU-capable browser** (Chrome 113+, Edge 113+, or Safari with WebGPU flag enabled).

## Project Structure

```
src/
  components/
    chat/        # Chat UI (layout, messages, sidebar, model picker)
    landing/     # Marketing / landing page sections
    ui/          # Shared UI primitives
  hooks/         # Custom React hooks (WebLLM, hardware detection, chat manager)
  lib/           # Model catalog, storage, constants, animations
  pages/         # Route-level components (ModelsPage)
  workers/       # Web Worker for off-thread inference
  types/         # Shared TypeScript types
```

## Ways to Contribute

### Add a model to the catalog

1. Find the model ID in the [WebLLM config](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts)
2. Add an entry to `src/lib/modelCatalog.ts` following the existing pattern
3. Open a PR with the model name, VRAM requirement, and a brief description

### Fix a bug

1. Open an issue first so we can discuss the approach
2. Fork the repo, create a branch (`fix/my-bug`)
3. Make your change, verify `npm run build` passes
4. Open a PR with a description and before/after if it's a UI fix

### Improve the UI

Check open issues tagged `ui/ux`. For larger redesigns, open a discussion first.

## Code Style

- TypeScript strict mode — no `any` unless absolutely necessary
- Tailwind CSS v4 for styling
- Lucide icons for all iconography
- No external API calls — everything must stay client-side

## Build & Verify

```bash
npm run build   # TypeScript check + Vite production build
npm run dev     # Dev server at localhost:5173
```

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
