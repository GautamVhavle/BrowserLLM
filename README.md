<p align="center">
  <img src="public/favicon.svg" width="100" alt="BrowserLLM Logo" />
</p>

<h1 align="center">BrowserLLM</h1>

<p align="center">
  <strong>Run 100+ AI models entirely in your browser — no servers, no API keys, 100% private.</strong>
</p>

<p align="center">
  <a href="https://browserllm.vercel.app">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-browserllm.vercel.app-00ff88?style=for-the-badge&labelColor=06060a" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/GautamVhavle/BrowserLLM/stargazers">
    <img src="https://img.shields.io/github/stars/GautamVhavle/BrowserLLM?style=flat-square&color=00ff88&labelColor=0d1117" alt="Stars" />
  </a>
  <a href="https://github.com/GautamVhavle/BrowserLLM/fork">
    <img src="https://img.shields.io/github/forks/GautamVhavle/BrowserLLM?style=flat-square&color=00d4ff&labelColor=0d1117" alt="Forks" />
  </a>
  <a href="https://github.com/GautamVhavle/BrowserLLM/issues">
    <img src="https://img.shields.io/github/issues/GautamVhavle/BrowserLLM?style=flat-square&color=ff6b35&labelColor=0d1117" alt="Issues" />
  </a>
  <a href="https://github.com/GautamVhavle/BrowserLLM/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/GautamVhavle/BrowserLLM?style=flat-square&color=a78bfa&labelColor=0d1117" alt="License" />
  </a>
  <a href="https://github.com/GautamVhavle/BrowserLLM/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-00ff88?style=flat-square&labelColor=0d1117" alt="PRs Welcome" />
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> · 
  <a href="#-how-it-works">How It Works</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-project-structure">Project Structure</a> ·
  <a href="#-contributing">Contributing</a> ·
  <a href="#-license">License</a>
</p>

<br />

> **Think ChatGPT, but running on _your_ hardware with zero cloud dependency.**  
> All inference runs locally via WebGPU. Your conversations never leave your device.

<br />

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧠 AI, Fully Local
- **100+ models** — Llama, Qwen, Phi, Gemma, Mistral, DeepSeek, SmolLM & more
- **WebGPU-accelerated** — Near-native GPU inference right in the browser
- **Real-time streaming** — Tokens stream as they're generated, rendered as Markdown

</td>
<td width="50%">

### 🔒 Privacy First
- **Zero servers** — No backend, no API calls, no data uploaded anywhere
- **Works offline** — PWA with service worker; fully functional without internet
- **Local storage only** — Chats saved in your browser, nothing touches the cloud

</td>
</tr>
<tr>
<td width="50%">

### 💬 Chat Experience
- **Multi-thread** — Create, switch, and manage multiple conversations
- **Per-message stats** — Tokens/sec, context usage, generation time for every response
- **Markdown rendering** — Code blocks with syntax highlighting, tables, lists
- **Model name per message** — See which model generated each response

</td>
<td width="50%">

### ⚡ Smart Model Management
- **Background downloads** — Download new models while chatting with the current one
- **Browser cache** — Models cached after first download, load in seconds next time
- **Hardware detection** — Auto-detects GPU, VRAM, WebGPU & shader-f16 support
- **Default model** — Set your preferred model, auto-selected when you open chat

</td>
</tr>
</table>

---

## 🔧 How It Works

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│                                                          │
│   ┌──────────────┐   postMessage   ┌─────────────────┐  │
│   │   React UI   │ ◄────────────► │   Web Worker    │  │
│   │  (main       │                 │  (MLC Engine)   │  │
│   │   thread)    │                 │                 │  │
│   └──────┬───────┘                 └────────┬────────┘  │
│          │                                  │           │
│          │ localStorage                     │ WebGPU    │
│          ▼                                  ▼           │
│   ┌──────────────┐                 ┌─────────────────┐  │
│   │  Chat        │                 │  Your GPU       │  │
│   │  History     │                 │  (VRAM)         │  │
│   └──────────────┘                 └─────────────────┘  │
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │    Cache API — Model weights persisted locally    │   │
│   └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

1. **Download once** — Quantized weights fetched from HuggingFace, stored in the browser Cache API
2. **Web Worker isolation** — MLC engine runs in a dedicated worker to keep the UI silky smooth
3. **GPU inference** — All matrix ops run on your GPU via WebGPU at near-native speed
4. **Stream to UI** — Tokens stream back in real-time via `postMessage`, rendered as rich Markdown
5. **Persist locally** — Chats saved to `localStorage`, restored on reload

---

## 🛠 Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build** | [Vite](https://vite.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **LLM Runtime** | [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) via WebGPU |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |
| **PWA** | Service Worker + Web App Manifest |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics) |

---

## 🌐 Browser Support

| Browser | Minimum Version | Status |
|:--------|:---------------|:-------|
| Chrome | 113+ | ✅ Supported |
| Edge | 113+ | ✅ Supported |
| Safari | 18.2+ | ✅ Supported |
| Firefox | — | ❌ No WebGPU yet |

> **Hardware:** Small models (~0.5B) work with 2 GB VRAM. Larger models (7B+) need a dedicated GPU with 6–8 GB+ VRAM.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A WebGPU-compatible browser

### Quick Start

```bash
# Clone the repo
git clone https://github.com/GautamVhavle/BrowserLLM.git
cd BrowserLLM

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** and you're running.

### Production Build

```bash
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview the built app locally
```

### All Scripts

| Command | What it does |
|:--------|:-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check → production build |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |

---

## 📁 Project Structure

```
BrowserAI/
├── public/
│   ├── favicon.svg              # App icon
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker
│   ├── robots.txt               # Search engine crawl rules
│   └── sitemap.xml              # XML sitemap
│
├── src/
│   ├── main.tsx                 # Entry — React root + SW registration
│   ├── App.tsx                  # Route definitions
│   ├── index.css                # Global styles + Tailwind
│   │
│   ├── types/index.ts           # Shared interfaces (Message, ChatSession, etc.)
│   │
│   ├── hooks/
│   │   ├── useWebLLM.ts         # Core — model loading, inference, stats
│   │   ├── useChatManager.ts    # Chat state — wraps useWebLLM + localStorage
│   │   ├── useHardwareDetect.ts # GPU/VRAM/WebGPU detection
│   │   ├── useModelCache.ts     # Cache API introspection
│   │   └── useOnlineStatus.ts   # Online/offline detection
│   │
│   ├── lib/
│   │   ├── modelCatalog.ts      # 100+ model definitions with metadata
│   │   ├── models.ts            # Public API re-exports
│   │   ├── storage.ts           # localStorage CRUD
│   │   ├── constants.ts         # Landing page content data
│   │   └── animations.ts        # Framer Motion variants
│   │
│   ├── workers/
│   │   └── engine.worker.ts     # Web Worker — MLC engine off main thread
│   │
│   ├── components/
│   │   ├── chat/                # Chat UI (layout, messages, input, stats, sidebar)
│   │   ├── landing/             # Landing page sections (hero, features, FAQ, etc.)
│   │   └── ui/                  # Shared UI (star field, loading bar, indicators)
│   │
│   └── pages/
│       └── ModelsPage.tsx       # Full model catalog with filters + hardware compat
│
├── index.html                   # HTML shell with SEO meta, structured data
├── vite.config.ts               # Vite + Tailwind plugin config
├── tsconfig.json                # TypeScript config
├── package.json
└── eslint.config.js
```

---

## 🤝 Contributing

**BrowserLLM is open source and contributions are welcome!**

Whether it's a bug fix, new feature, documentation improvement, or just a typo — every contribution helps.

### How to contribute

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "feat: add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code conventions

- TypeScript strict mode
- Functional React components with hooks
- Tailwind CSS for all styling (no CSS modules)
- `lucide-react` for icons
- Barrel exports via `index.ts` files

### Ideas for contributions

- 🌍 Internationalization (i18n)
- 📱 Mobile UX improvements
- 🎨 Theme customization
- 📊 Advanced model benchmarking
- 🧪 Test coverage
- 📝 Documentation

---

## 📄 License

This project is open source under the **[MIT License](LICENSE)**.

Free to use, modify, and distribute.

---

<p align="center">
  <sub>
    Built with ❤️ by <a href="https://github.com/AquaMystic">Gautam Vhavle</a>
  </sub>
</p>

<p align="center">
  <a href="https://github.com/GautamVhavle/BrowserLLM/stargazers">
    <img src="https://img.shields.io/badge/⭐_Star_this_repo-if_you_find_it_useful!-00ff88?style=for-the-badge&labelColor=06060a" alt="Star this repo" />
  </a>
</p>
