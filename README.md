<p align="center">
  <img src="public/favicon.svg" width="80" alt="BrowserAI Logo" />
</p>

<h1 align="center">BrowserAI</h1>

<p align="center">
  <strong>A fully local AI chatbot that runs LLMs entirely in your browser.</strong><br />
  No servers. No API keys. 100% private. Works offline.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## What is BrowserAI?

BrowserAI loads open-source LLMs (Qwen, Llama, Phi, Gemma, and more) directly into your browser using **WebGPU** for GPU-accelerated inference. Models are downloaded once and cached locally — every conversation stays on your device.

Think ChatGPT, but running on *your* hardware with zero cloud dependency.

## Features

- **100+ models** — Qwen, Llama, Phi, Gemma, Mistral, DeepSeek, SmolLM, and more
- **Fully local** — All inference runs on-device via WebGPU; nothing leaves your browser
- **Offline-first** — PWA with service worker; works without internet after first model download
- **Multi-chat** — Create, switch between, and manage multiple conversation threads
- **Thread URLs** — Each chat gets a unique `/chat/:threadId` route for direct linking
- **Markdown rendering** — Rich formatting with syntax-highlighted code blocks, tables, and more
- **LLM stats** — Real-time tokens/sec, context usage pie chart, prompt stats after each generation
- **Background downloads** — Download a new model while chatting with the current one
- **Cancel downloads** — Abort model downloads at any time
- **Multimodal-ready** — Attachment button for vision models (greyed out with tooltip for text-only models)
- **Online/offline banner** — Persistent offline warning; auto-dismissing "back online" notification
- **Hardware detection** — Auto-detects GPU, VRAM, WebGPU support, and shader-f16 capability
- **Model cache management** — See which models are cached, delete cached models
- **Custom models** — Add any WebLLM-compatible model ID
- **Mobile responsive** — Fully responsive design with safe-area handling for PWA
- **Dark theme** — Carefully designed dark UI with animated star field background

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vite.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| LLM Runtime | [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) via WebGPU |
| Routing | [React Router v7](https://reactrouter.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |
| PWA | Service Worker + Web App Manifest |

## Browser Requirements

BrowserAI requires a browser with **WebGPU** support:

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 113+ |
| Edge | 113+ |
| Safari | 18.2+ |
| Firefox | Not yet supported |

You also need a GPU with sufficient VRAM. Small models (~0.5B) work with 2 GB VRAM; larger models (7B+) need 6-8 GB+.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A WebGPU-compatible browser (see above)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/<your-username>/BrowserAI.git
cd BrowserAI

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build    # Type-check + Vite production build
npm run preview  # Preview the production build locally
```

## Project Structure

```
BrowserAI/
├── public/
│   ├── favicon.svg            # App icon
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker for offline support
├── src/
│   ├── main.tsx               # Entry point — React root + service worker registration
│   ├── App.tsx                # Route definitions (/, /models, /chat/:threadId)
│   ├── index.css              # Global styles + Tailwind import
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces (Message, ChatSession, etc.)
│   ├── hooks/
│   │   ├── useWebLLM.ts       # Core hook — model loading, inference, stats, background downloads
│   │   ├── useChatManager.ts  # Chat state management — wraps useWebLLM + localStorage
│   │   ├── useOnlineStatus.ts # Online/offline detection
│   │   ├── useHardwareDetect.ts # WebGPU hardware capability detection
│   │   └── useModelCache.ts   # Browser cache introspection for downloaded models
│   ├── lib/
│   │   ├── models.ts          # Re-exports from modelCatalog (public API)
│   │   ├── modelCatalog.ts    # 100+ model definitions with metadata
│   │   ├── storage.ts         # localStorage CRUD for chats, custom models
│   │   ├── constants.ts       # Landing page content data
│   │   └── animations.ts      # Framer Motion animation variants
│   ├── workers/
│   │   └── engine.worker.ts   # Web Worker — runs MLC engine off the main thread
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatLayout.tsx     # Main chat UI shell (sidebar + header + content)
│   │   │   ├── ChatWindow.tsx     # Scrollable message list
│   │   │   ├── ChatInput.tsx      # Message input with model selector + attachment
│   │   │   ├── MessageBubble.tsx  # Single message — markdown rendering for assistant
│   │   │   ├── StatsPanel.tsx     # Post-generation stats (tokens/sec, pie chart)
│   │   │   ├── Sidebar.tsx        # Chat thread list
│   │   │   ├── EmptyState.tsx     # Empty chat prompt suggestions
│   │   │   ├── ModelModal.tsx     # Full-screen model selector with search
│   │   │   ├── ModelSelector.tsx  # Compact model dropdown (legacy)
│   │   │   └── index.ts          # Barrel exports
│   │   ├── landing/
│   │   │   ├── Landing.tsx        # Landing page composition
│   │   │   ├── HeroSection.tsx    # Hero with animated stats
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── ComparisonSection.tsx
│   │   │   ├── ModelsSection.tsx
│   │   │   ├── TechStackSection.tsx
│   │   │   ├── DeepDiveSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── CtaSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── index.ts
│   │   └── ui/
│   │       ├── StarField.tsx                # Animated star background (canvas)
│   │       ├── ModelLoadingBar.tsx           # Model download progress + cancel
│   │       ├── OnlineIndicator.tsx           # Online/offline badge
│   │       ├── BackgroundDownloadIndicator.tsx # Floating download progress cards
│   │       ├── SectionHeader.tsx             # Reusable animated section header
│   │       └── index.ts
│   └── pages/
│       └── ModelsPage.tsx     # Full model catalog with hardware detection + filters
├── index.html                 # HTML shell
├── vite.config.ts             # Vite + Tailwind plugin configuration
├── tsconfig.json              # TypeScript project references
├── tsconfig.app.json          # App-specific TS config
├── tsconfig.node.json         # Node/Vite TS config
├── eslint.config.js           # ESLint configuration
└── package.json
```

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│                                                     │
│  ┌──────────────┐    messages    ┌───────────────┐  │
│  │  React UI    │ ◄──────────►  │  Web Worker   │  │
│  │  (main       │   postMessage  │  (MLC Engine) │  │
│  │   thread)    │                │               │  │
│  └──────────────┘                └───────┬───────┘  │
│         │                                │          │
│         │ localStorage                   │ WebGPU   │
│         ▼                                ▼          │
│  ┌──────────────┐                ┌───────────────┐  │
│  │  Chat        │                │  GPU          │  │
│  │  History     │                │  (VRAM)       │  │
│  └──────────────┘                └───────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  Cache API — Model weights persisted locally  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

1. **Model Download** — Quantized model weights are fetched from HuggingFace and stored in the browser's Cache API. Subsequent visits load from cache instantly.
2. **Web Worker** — The MLC engine runs in a dedicated Web Worker to keep the UI thread completely free.
3. **WebGPU Inference** — All matrix multiplications run on your GPU via the WebGPU API at near-native speed.
4. **Streaming** — Tokens stream back to the UI in real-time via `postMessage`, rendered as Markdown.
5. **Persistence** — Chat sessions are saved to `localStorage` and restored on reload.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check with `tsc` then build with Vite |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Code Style

- TypeScript strict mode
- Functional React components with hooks
- Tailwind CSS for styling (no CSS modules)
- `lucide-react` for icons
- Barrel exports via `index.ts` files

## License

This project is open source under the [MIT License](LICENSE).
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
