/**
 * Static content data for the landing page sections.
 * Keeping content separate from components makes it easy to edit copy.
 */
import type { ReactNode } from "react";
import { Cpu, Gauge, Globe, HardDrive, Lock, Shield, Wifi, Zap, Layers, Smartphone } from "lucide-react";
import { createElement } from "react";

export const HERO_STATS = [
  { value: "100+", label: "AI Models" },
  { value: "0", label: "Servers" },
  { value: "100%", label: "Private & Offline" },
];

export interface StepItem {
  step: string;
  icon: ReactNode;
  title: string;
  desc: string;
  detail: string;
}

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    step: "01",
    icon: createElement(HardDrive, { className: "w-6 h-6" }),
    title: "Pick & Download",
    desc: "Browse 100+ models in the Model Library, from tiny 135M to 70B powerhouses. Your chosen model is fetched once and cached in the browser's Cache API. Every visit after that loads instantly.",
    detail: "4-bit quantization (q4f32) shrinks models by ~8x with minimal quality loss, making even large models browser-friendly.",
  },
  {
    step: "02",
    icon: createElement(Cpu, { className: "w-6 h-6" }),
    title: "WebGPU Acceleration",
    desc: "The model is loaded into your GPU's VRAM via the WebGPU API, the same technology that powers modern browser games and 3D graphics.",
    detail: "WebGPU provides near-native GPU compute performance, ~10x faster than WebGL fallback.",
  },
  {
    step: "03",
    icon: createElement(Zap, { className: "w-6 h-6" }),
    title: "Token Generation",
    desc: "A Web Worker runs the inference loop off the main thread. Tokens stream back to the UI in real-time, just like ChatGPT, but local.",
    detail: "Web Workers keep the UI thread free, no janky scrolling or frozen inputs during generation.",
  },
];

export interface DeepDiveItem {
  icon: ReactNode;
  title: string;
  desc: string;
  color: string;
  border: string;
  dot: string;
}

export const DEEP_DIVE_ITEMS: DeepDiveItem[] = [
  {
    icon: createElement(Gauge, { className: "w-5 h-5" }),
    title: "4-bit Quantization",
    desc: "The original 32-bit floating point weights are compressed to 4-bit integers using advanced quantization (q4f32). This shrinks the model by ~8x with minimal quality loss, the key breakthrough that makes edge AI practical.",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/20 hover:border-orange-500/40",
    dot: "bg-orange-400",
  },
  {
    icon: createElement(Cpu, { className: "w-5 h-5" }),
    title: "WebAssembly Runtime",
    desc: "WebLLM compiles the model execution graph into WebAssembly via Apache TVM. WASM runs at near-native speed, handling the control logic while WebGPU handles the heavy matrix multiplications on your GPU.",
    color: "from-pink-500/20 to-pink-500/5",
    border: "border-pink-500/20 hover:border-pink-500/40",
    dot: "bg-pink-400",
  },
  {
    icon: createElement(Globe, { className: "w-5 h-5" }),
    title: "Browser Cache Persistence",
    desc: "Model weights are stored in the browser's Cache API after the first download. Subsequent visits skip the download entirely, the model loads from local cache in seconds, not minutes.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    dot: "bg-emerald-400",
  },
  {
    icon: createElement(Zap, { className: "w-5 h-5" }),
    title: "Web Worker Isolation",
    desc: "All inference runs in a dedicated Web Worker thread. The main thread stays completely free for UI rendering, smooth scrolling, typing, and animations even while the model generates tokens.",
    color: "from-yellow-500/20 to-yellow-500/5",
    border: "border-yellow-500/20 hover:border-yellow-500/40",
    dot: "bg-yellow-400",
  },
];

export interface FeatureItem {
  icon: ReactNode;
  title: string;
  desc: string;
}

export const FEATURES: FeatureItem[] = [
  {
    icon: createElement(Lock, { className: "w-6 h-6" }),
    title: "Total Privacy",
    desc: "Your conversations never leave your device. No logging, no analytics, no data harvesting.",
  },
  {
    icon: createElement(Wifi, { className: "w-6 h-6" }),
    title: "Works Offline",
    desc: "After the first model download, the entire app works without any internet connection.",
  },
  {
    icon: createElement(Shield, { className: "w-6 h-6" }),
    title: "Zero Cost",
    desc: "No API keys, no subscriptions, no per-token charges. It's your GPU doing the work.",
  },
  {
    icon: createElement(Zap, { className: "w-6 h-6" }),
    title: "Streaming Output",
    desc: "Tokens appear in real-time as the model generates, just like ChatGPT, but local.",
  },
  {
    icon: createElement(Layers, { className: "w-6 h-6" }),
    title: "100+ Model Library",
    desc: "Llama, Qwen, Phi, Gemma, Mistral, DeepSeek, and more. Browse, filter, and run any model from the built-in catalog.",
  },
  {
    icon: createElement(Smartphone, { className: "w-6 h-6" }),
    title: "Mobile Ready",
    desc: "Fully responsive UI that works on phones, tablets, and desktops. Install as a PWA.",
  },
];
