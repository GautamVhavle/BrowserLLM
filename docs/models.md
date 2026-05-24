# Models

> How the model catalog works, hardware tiers, and how to add models.

[← Back to README](../README.md)

---

## Overview

BrowserLLM ships with a catalog of **153 models** from 13+ model families. Every model runs entirely in the browser via WebGPU — no server required.

The catalog lives in `src/lib/modelCatalog.ts`. Each entry contains the metadata needed to display the model in the UI, check hardware compatibility, and load it via WebLLM.

---

## Model Families

| Family | Provider | Sizes |
|--------|----------|-------|
| Qwen 3.5 / 3 / 2.5 | Alibaba | 0.5B – 32B |
| Llama 3.2 / 3.1 / 3 | Meta | 1B – 70B |
| Phi-4 / 3.5 / 3 | Microsoft | 3.8B – 14B |
| Gemma 3 / 2 | Google | 1B – 27B |
| Mistral / Ministral | Mistral AI | 3B – 7B |
| DeepSeek R1 | DeepSeek | 1.5B – 70B |
| SmolLM 2 | HuggingFace | 135M – 1.7B |
| Hermes 3 | NousResearch | 8B – 70B |
| OLMo 2 | Allen AI | 1B – 7B |
| StableLM | Stability AI | 1.6B – 3B |
| TinyLlama | Community | 1.1B |
| RedPajama | Together AI | 3B |

---

## Categories

Each model is tagged with one or more categories:

| Category | Description |
|----------|-------------|
| `general` | General-purpose chat and reasoning |
| `coding` | Optimized for code generation and programming tasks |
| `math` | Strong mathematical reasoning |
| `reasoning` | Chain-of-thought and logical reasoning |
| `vision` | Multimodal — accepts image inputs |
| `uncensored` | Unfiltered / uncensored variants |
| `embedding` | Text embedding models (not for chat) |

---

## Hardware Tiers

Models are automatically classified into tiers based on VRAM requirements:

| Tier | VRAM | Examples |
|------|------|---------|
| **Low** | < 1.5 GB | SmolLM 135M/360M, TinyLlama 1.1B |
| **Medium** | 1.5 – 4 GB | Qwen 2.5 3B, Phi-4 Mini, Gemma 3 1B |
| **High** | 4 – 8 GB | Llama 3.1 8B, Qwen 2.5 7B, Mistral 7B |
| **Ultra** | 8+ GB | Llama 3.1 70B, Qwen 2.5 32B |

The `useHardwareDetect` hook estimates the user's available VRAM and the catalog provides `getModelsForVRAM(vramMB)` to filter to compatible models.

---

## Model Entry Format

Each model in the catalog has these fields:

```typescript
interface CatalogModel {
  id: string;                // WebLLM model ID (e.g. "Qwen3.5-2B-q4f16_1-MLC")
  name: string;              // Display name (e.g. "Qwen 3.5 2B")
  family: ModelFamily;       // Model family identifier
  provider: string;          // Organization (e.g. "Alibaba")
  description: string;       // Short description
  parameterCount: string;    // Human-readable (e.g. "2B")
  parameterCountNum: number; // Numeric for sorting (e.g. 2.0)
  vramRequired: number;      // Estimated VRAM in MB
  contextWindow: number;     // Context window size (e.g. 32768)
  quantization: string;      // Quantization type (e.g. "q4f16_1")
  requiresF16: boolean;      // Whether shader-f16 GPU feature is needed
  lowResource: boolean;      // Suitable for low-end devices
  categories: ModelCategory[]; // Classification tags
  hardwareTier: HardwareTier;  // Auto-computed from vramRequired
  isRecommended?: boolean;     // Featured in the recommended section
}
```

---

## Catalog API

The catalog exports helper functions for querying models:

```typescript
import {
  MODEL_CATALOG,          // Full array of 153 models
  getCatalogModel,        // Find by ID
  getModelsByFamily,      // Filter by family (e.g. "qwen")
  getModelsByCategory,    // Filter by category (e.g. "coding")
  getRecommendedModels,   // Get featured models
  getModelsForVRAM,       // Get models that fit in given VRAM
  DEFAULT_MODEL_ID,       // Default model: "Qwen3.5-2B-q4f16_1-MLC"
  FAMILY_LABELS,          // Human-readable family names
  CATEGORY_LABELS,        // Category display names
  TIER_LABELS,            // Tier label + color + description
} from "../lib/models";
```

---

## Adding a Model to the Catalog

### Step 1: Find the WebLLM model ID

Browse the [MLC AI HuggingFace org](https://huggingface.co/mlc-ai) for available models. The model ID is the repo name (e.g. `Qwen3.5-2B-q4f16_1-MLC`).

### Step 2: Add the entry

Open `src/lib/modelCatalog.ts` and add an entry to the `MODEL_CATALOG` array:

```typescript
{
  id: "Qwen3.5-2B-q4f16_1-MLC",
  name: "Qwen 3.5 2B",
  family: "qwen",
  provider: "Alibaba",
  description: "Excellent balance of speed and capability for everyday tasks",
  parameterCount: "2B",
  parameterCountNum: 2.0,
  vramRequired: 2200,       // Check the model card for VRAM estimate
  contextWindow: 32768,
  quantization: "q4f16_1",
  requiresF16: true,        // true for q4f16 quantizations
  lowResource: false,
  categories: ["general"],
  hardwareTier: tier(2200), // Use the tier() helper
  isRecommended: false,
},
```

### Step 3: Verify

1. Run `npm run dev`
2. Go to `/models` — your model should appear in the catalog
3. Try loading it in `/chat` to confirm it works

### Notes

- The `tier()` helper function computes `hardwareTier` from `vramRequired` automatically
- Set `requiresF16: true` for `q4f16` quantizations — these need the `shader-f16` GPU feature
- Set `lowResource: true` for models under ~1 GB that work on integrated GPUs
- VRAM estimates come from the WebLLM model cards on HuggingFace

---

## Custom Models (User-Added)

Users can add any WebLLM-compatible model ID at runtime via the UI:

1. Go to `/models` or open the model selector in chat
2. Click "Add Custom Model"
3. Enter the WebLLM model ID (e.g. `Llama-3.1-8B-Instruct-q4f32_1-MLC`)

Custom models are stored in `localStorage` under `browserai-custom-models` and persist across sessions. They appear alongside catalog models but without rich metadata (no VRAM estimate, description, etc.).

---

## Quantization Types

| Type | Description | VRAM | Quality |
|------|-------------|------|---------|
| `q4f16_1` | 4-bit weights, fp16 activations | Low | Good |
| `q4f32_1` | 4-bit weights, fp32 activations | Medium | Better (no shader-f16 needed) |
| `q0f16` | No quantization, fp16 | High | Best |
| `q0f32` | No quantization, fp32 | Highest | Best |

Most models in the catalog use `q4f16_1` or `q4f32_1` for the best VRAM-to-quality trade-off. The `q4f32_1` variants work on GPUs without the `shader-f16` feature.

---

## Known Quirks

### Gemma 3 sliding window

Gemma 3 models use sliding window attention. WebLLM requires only one of `context_window_size` or `sliding_window_size` to be positive, but the default config sets both. BrowserLLM automatically detects Gemma 3 models and passes `{ context_window_size: -1 }` as a workaround.

### Large model downloads

Models range from ~80 MB (SmolLM 135M) to 5+ GB (Llama 70B). Downloads are cached in the browser Cache API and persist until manually cleared. The app supports cancelling downloads and downloading in the background while chatting.
