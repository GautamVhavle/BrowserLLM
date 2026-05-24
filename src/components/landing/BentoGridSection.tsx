import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerFast, defaultTransition } from "../../lib/animations";
import { SectionHeader } from "../ui/SectionHeader";
import { useEffect, useState, useRef } from "react";

/* ────────────────────────────────────────────────────────────
   Interactive card visualizations
   All backgrounds use transparent overlays (white/[0.0x]) so
   the landing page's dynamic aurora/gradient shows through.
   ──────────────────────────────────────────────────────────── */

/** Privacy: network packet visualization with firewall */
function PrivacyViz() {
  const PACKETS = [
    { label: "location", y: 8 },
    { label: "cookies", y: 28 },
    { label: "history", y: 48 },
    { label: "ip_addr", y: 68 },
    { label: "keylog", y: 88 },
  ];

  return (
    <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/[0.04] mt-5">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />

      {/* Firewall wall */}
      <div className="absolute left-[52%] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#00ff88]/40 via-[#00ff88]/20 to-[#00ff88]/40">
        <motion.div
          className="absolute inset-x-0 h-4 bg-[#00ff88]/30 blur-sm"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="absolute left-[52%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          animate={{ boxShadow: ["0 0 8px rgba(0,255,136,0.15)", "0 0 20px rgba(0,255,136,0.3)", "0 0 8px rgba(0,255,136,0.15)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-7 h-7 rounded-md border border-[#00ff88]/50 bg-white/[0.02] backdrop-blur-sm flex items-center justify-center"
        >
          <svg className="w-3.5 h-3.5 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </motion.div>
      </div>

      {/* Incoming packets that get blocked */}
      {PACKETS.map((pkt, i) => (
        <motion.div
          key={pkt.label}
          className="absolute flex items-center gap-1"
          style={{ top: `${pkt.y}%` }}
          initial={{ left: "-15%", opacity: 0 }}
          animate={{
            left: ["-5%", "40%", "36%"],
            opacity: [0, 1, 0],
            scale: [0.9, 1, 0.7],
          }}
          transition={{
            duration: 2.5,
            delay: i * 0.5,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeOut",
          }}
        >
          <div className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">
            <span className="text-[7px] font-mono text-red-400/70">{pkt.label}</span>
          </div>
          <div className="w-6 h-[1px] bg-gradient-to-r from-red-400/40 to-transparent" />
        </motion.div>
      ))}

      {/* Labels */}
      <div className="absolute right-3 bottom-2 text-[7px] font-mono text-[#00ff88]/25 tracking-widest">
        YOUR DEVICE
      </div>
      <div className="absolute left-3 bottom-2 text-[7px] font-mono text-red-400/20 tracking-widest">
        INTERNET
      </div>
    </div>
  );
}

/** Offline: connection status dashboard */
function OfflineViz() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const durations = [2500, 1200, 3000];
    const timeout = setTimeout(() => setPhase((p) => (p + 1) % 3), durations[phase]);
    return () => clearTimeout(timeout);
  }, [phase]);

  const statusConfig = [
    { label: "CONNECTED", color: "#00d4ff", bars: [1, 1, 1, 1] },
    { label: "DISCONNECTED", color: "#ff6b35", bars: [1, 1, 0.3, 0.1] },
    { label: "OFFLINE MODE", color: "#00ff88", bars: [0, 0, 0, 0] },
  ][phase];

  return (
    <div className="mt-5 rounded-xl border border-white/[0.04] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: statusConfig.color,
              boxShadow: `0 0 8px ${statusConfig.color}40`,
            }}
            transition={{ duration: 0.3 }}
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="text-[10px] font-mono tracking-widest"
              style={{ color: `${statusConfig.color}90` }}
            >
              {statusConfig.label}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-end gap-[3px]">
          {[8, 12, 16, 20].map((h, i) => (
            <motion.div
              key={i}
              className="w-[4px] rounded-sm"
              style={{ height: h }}
              animate={{
                opacity: statusConfig.bars[i],
                backgroundColor: statusConfig.color,
              }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>

      <div className="h-8 rounded-lg overflow-hidden relative border border-white/[0.02]">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 32">
          <motion.path
            d={phase === 2
              ? "M0,16 L200,16"
              : "M0,20 Q10,8 20,18 Q30,28 40,14 Q50,4 60,16 Q70,26 80,12 Q90,6 100,18 Q110,24 120,10 Q130,4 140,20 Q150,28 160,14 Q170,6 180,18 Q190,24 200,16"
            }
            fill="none"
            stroke={statusConfig.color}
            strokeWidth="1.5"
            strokeOpacity={phase === 1 ? 0.2 : 0.4}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        {phase === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-[#00ff88]/50 tracking-widest"
          >
            ALL SYSTEMS LOCAL ✓
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** WebGPU: GPU benchmark bar chart */
function WebGPUViz() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const benchmarks = [
    { label: "WebGPU", value: 94, color: "#ff6b35" },
    { label: "WASM", value: 41, color: "#ff6b35" },
    { label: "CPU", value: 12, color: "#ff6b35" },
  ];

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-end gap-3 h-24 px-2">
        {benchmarks.map((b, i) => (
          <div
            key={b.label}
            className="flex-1 flex flex-col items-center gap-1 cursor-default"
            onMouseEnter={() => setHoveredBar(i)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <motion.div
              className="text-[8px] font-mono tabular-nums"
              style={{ color: `${b.color}${hoveredBar === i ? "cc" : "60"}` }}
              animate={{ opacity: hoveredBar === i ? 1 : 0.6 }}
            >
              {b.value} tok/s
            </motion.div>
            <div className="w-full relative rounded-t-md overflow-hidden border border-b-0 border-white/[0.02]" style={{ height: 64 }}>
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-t-md"
                style={{
                  background: i === 0
                    ? `linear-gradient(to top, ${b.color}20, ${b.color}80)`
                    : `${b.color}${i === 1 ? "30" : "15"}`,
                }}
                initial={{ height: 0 }}
                whileInView={{ height: `${b.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {i === 0 && (
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ background: `linear-gradient(to top, transparent, ${b.color}40)` }}
                  />
                )}
              </motion.div>
            </div>
            <span className="text-[8px] font-mono text-white/20">{b.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 text-[8px] font-mono text-[#ff6b35]/30">
        <span className="w-1 h-1 rounded-full bg-[#ff6b35]/60" />
        inference speed comparison
      </div>
    </div>
  );
}

/** Model Library: scrolling model cards */
const MODELS = [
  { name: "Llama 3.1", size: "8B", family: "Meta", q: "q4f16" },
  { name: "Qwen2.5", size: "7B", family: "Alibaba", q: "q4f32" },
  { name: "Phi-4", size: "3.8B", family: "Microsoft", q: "q4f16" },
  { name: "Gemma 2", size: "2B", family: "Google", q: "q4f16" },
  { name: "Mistral", size: "7B", family: "Mistral AI", q: "q4f32" },
  { name: "DeepSeek R1", size: "1.5B", family: "DeepSeek", q: "q4f16" },
  { name: "SmolLM2", size: "1.7B", family: "HuggingFace", q: "q4f16" },
  { name: "TinyLlama", size: "1.1B", family: "Community", q: "q4f16" },
  { name: "Llama 3.2", size: "3B", family: "Meta", q: "q4f16" },
  { name: "Qwen2.5", size: "3B", family: "Alibaba", q: "q4f16" },
  { name: "Phi-3.5", size: "3.8B", family: "Microsoft", q: "q4f32" },
  { name: "Gemma 2", size: "9B", family: "Google", q: "q4f16" },
];

function ModelLibraryViz() {
  return (
    <div className="relative mt-5 overflow-hidden h-[130px]">
      {/* Fade edges — use transparent masks instead of solid colors */}
      <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, var(--bento-card-bg, rgba(0,0,0,0.4)), transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, var(--bento-card-bg, rgba(0,0,0,0.4)), transparent)" }} />

      {/* Row 1 */}
      <motion.div
        className="flex gap-2.5 mb-2.5"
        animate={{ x: [0, -800] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {[...MODELS, ...MODELS].map((m, i) => (
          <div
            key={`r1-${i}`}
            className="shrink-0 group/card px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-[#00d4ff]/25 hover:bg-[#00d4ff]/[0.04] transition-all duration-300 cursor-default min-w-[120px]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-white/50 group-hover/card:text-[#00d4ff]/80 transition-colors">{m.name}</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-white/20">{m.size}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[7px] font-mono text-white/15">{m.family}</span>
              <span className="text-[7px] font-mono text-white/10">·</span>
              <span className="text-[7px] font-mono text-white/10">{m.q}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Row 2 — reverse */}
      <motion.div
        className="flex gap-2.5 mb-2.5"
        animate={{ x: [-600, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...MODELS.slice(4), ...MODELS.slice(4)].map((m, i) => (
          <div
            key={`r2-${i}`}
            className="shrink-0 px-3 py-2 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] transition-all duration-300 cursor-default min-w-[120px]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-white/30">{m.name}</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] text-white/15">{m.size}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[7px] font-mono text-white/10">{m.family}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Row 3 — faintest */}
      <motion.div
        className="flex gap-2.5"
        animate={{ x: [-200, -900] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...MODELS.slice(2), ...MODELS.slice(2)].map((m, i) => (
          <div
            key={`r3-${i}`}
            className="shrink-0 px-3 py-2 rounded-lg border border-white/[0.03] cursor-default min-w-[120px]"
          >
            <span className="text-[11px] font-mono text-white/15">{m.name}</span>
            <span className="text-[8px] font-mono text-white/[0.08] ml-2">{m.size}</span>
          </div>
        ))}
      </motion.div>

      {/* Count badge */}
      <div className="absolute bottom-2 right-2 z-20 text-[9px] font-mono text-[#00d4ff]/30 px-2 py-0.5 rounded-full border border-[#00d4ff]/10 backdrop-blur-md bg-white/[0.03]">
        100+ models
      </div>
    </div>
  );
}

/** Streaming: chat streaming with metrics */
function StreamingViz() {
  const fullText = "Transformers use self-attention mechanisms to process sequences in parallel, unlike traditional RNNs which work sequentially.";
  const [charIdx, setCharIdx] = useState(0);
  const [tokCount, setTokCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCharIdx((c) => {
        if (c >= fullText.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => {
            setCharIdx(0);
            setTokCount(0);
            setCycle((prev) => prev + 1);
          }, 2000);
          return c;
        }
        setTokCount((t) => t + 1);
        return c + 1;
      });
    }, 35);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [cycle, fullText.length]);

  const speed = charIdx > 5 ? (38 + Math.sin(charIdx * 0.3) * 8).toFixed(1) : "0.0";

  return (
    <div className="mt-5 rounded-xl border border-white/[0.04] overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.04] bg-white/[0.015]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/50" />
          <span className="text-[8px] font-mono text-white/20">streaming</span>
        </div>
        <span className="text-[8px] font-mono text-[#00ff88]/30 tabular-nums">{speed} tok/s</span>
      </div>
      {/* Output */}
      <div className="p-3 min-h-[60px]">
        <div className="text-[11px] font-mono text-white/40 leading-[1.7]">
          {fullText.slice(0, charIdx)}
          {charIdx < fullText.length && (
            <span className="inline-block w-[2px] h-[13px] bg-[#00ff88]/70 ml-px -mb-[2px] animate-cursor" />
          )}
        </div>
      </div>
      {/* Stats bar */}
      <div className="flex items-center gap-4 px-3 py-1.5 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] font-mono text-white/15">tokens</span>
          <motion.span className="text-[8px] font-mono text-[#00ff88]/40 tabular-nums" key={tokCount}>
            {tokCount}
          </motion.span>
        </div>
        <div className="flex-1 h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#00ff88]/20 to-[#00ff88]/50"
            animate={{ width: `${(charIdx / fullText.length) * 100}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
        <span className="text-[7px] font-mono text-white/10 tabular-nums">
          {Math.round((charIdx / fullText.length) * 100)}%
        </span>
      </div>
    </div>
  );
}

/** Zero Cost: live cost savings */
function ZeroCostViz() {
  const [queries, setQueries] = useState(0);
  const [saved, setSaved] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const batch = Math.floor(Math.random() * 3) + 1;
      setQueries((q) => q + batch);
      setSaved((s) => s + batch * 0.003);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/[0.04] p-3">
          <div className="text-[8px] font-mono text-white/15 mb-1.5 tracking-wider">QUERIES</div>
          <motion.div
            className="text-xl font-mono text-[#ff6b35]/70 tabular-nums leading-none"
            key={queries}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
          >
            {queries.toLocaleString()}
          </motion.div>
        </div>
        <div className="rounded-lg border border-white/[0.04] p-3">
          <div className="text-[8px] font-mono text-white/15 mb-1.5 tracking-wider">TOTAL COST</div>
          <div className="text-xl font-mono text-[#00ff88]/70 leading-none">$0.00</div>
        </div>
      </div>
      <div className="rounded-lg bg-[#00ff88]/[0.03] border border-[#00ff88]/[0.08] px-3 py-2 flex items-center justify-between">
        <span className="text-[8px] font-mono text-[#00ff88]/30">estimated savings vs API</span>
        <motion.span
          className="text-[10px] font-mono text-[#00ff88]/60 tabular-nums"
          key={Math.floor(saved * 100)}
          initial={{ y: 2, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
        >
          ${saved.toFixed(2)}
        </motion.span>
      </div>
    </div>
  );
}

/** Cache: multi-model download manager */
function CacheViz() {
  const CACHE_MODELS = [
    { name: "gemma-2b-q4f16", size: "1.4 GB" },
    { name: "phi-3-mini-q4", size: "2.1 GB" },
    { name: "llama-3.2-1b", size: "0.7 GB" },
  ];

  const [progresses, setProgresses] = useState([0, 0, 0]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgresses((prev) => {
        const next = [...prev];
        const currentActive = next.findIndex((p) => p < 100);
        if (currentActive === -1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => {
            setProgresses([0, 0, 0]);
            setActiveIdx(0);
            setCycle((c) => c + 1);
          }, 2500);
          return next;
        }
        setActiveIdx(currentActive);
        next[currentActive] = Math.min(next[currentActive] + Math.random() * 6 + 2, 100);
        return next;
      });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [cycle]);

  return (
    <div className="mt-5 rounded-xl border border-white/[0.04] overflow-hidden">
      <div className="px-3 py-1.5 border-b border-white/[0.04] bg-white/[0.015] flex items-center justify-between">
        <span className="text-[8px] font-mono text-white/20 tracking-wider">MODEL CACHE</span>
        <span className="text-[8px] font-mono text-[#00d4ff]/30">{progresses.filter(p => p >= 100).length}/3</span>
      </div>
      <div className="p-2.5 space-y-1.5">
        {CACHE_MODELS.map((model, i) => {
          const done = progresses[i] >= 100;
          const active = i === activeIdx && !done;
          return (
            <div key={model.name} className="flex items-center gap-2.5">
              <motion.div
                className="w-3 h-3 rounded-sm flex items-center justify-center shrink-0 border"
                animate={{
                  backgroundColor: done ? "rgba(0,212,255,0.08)" : active ? "rgba(0,212,255,0.03)" : "transparent",
                  borderColor: done ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.04)",
                }}
              >
                {done && <span className="text-[6px] text-[#00d4ff]">✓</span>}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[9px] font-mono truncate ${done ? "text-[#00d4ff]/50" : "text-white/25"}`}>{model.name}</span>
                  <span className="text-[7px] font-mono text-white/10 ml-2 shrink-0">{model.size}</span>
                </div>
                <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: done ? "#00d4ff60" : "linear-gradient(90deg, #00d4ff30, #00d4ff70)",
                    }}
                    animate={{ width: `${Math.min(progresses[i], 100)}%` }}
                    transition={{ duration: 0.08 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Mobile Ready: PWA phone mockup with live chat UI */
function MobileViz() {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    { role: "user", text: "What is WebGPU?" },
    { role: "ai", text: "WebGPU is a modern graphics API..." },
    { role: "user", text: "Can it run LLMs?" },
    { role: "ai", text: "Yes! BrowserLLM uses WebGPU to..." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % (messages.length + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="mt-5 flex items-center justify-center">
      <motion.div
        className="relative w-[140px] h-[240px] rounded-[20px] border-2 border-white/[0.08] overflow-hidden backdrop-blur-sm"
        animate={{ rotateY: [0, 3, 0, -3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformPerspective: 600 }}
      >
        {/* Phone inner bg — very subtle so page bg shows */}
        <div className="absolute inset-0 bg-white/[0.02]" />

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-[6px] bg-white/[0.03] rounded-b-lg border-b border-x border-white/[0.06] z-20" />

        {/* Status bar */}
        <div className="relative z-10 flex items-center justify-between px-3 pt-2.5 pb-1">
          <span className="text-[5px] font-mono text-white/20">9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex items-end gap-[1px]">
              {[3, 4, 5, 6].map((h) => (
                <div key={h} className="w-[2px] rounded-full bg-white/20" style={{ height: h }} />
              ))}
            </div>
            <div className="w-4 h-2 rounded-sm border border-white/20 flex items-center justify-end pr-[1px]">
              <div className="w-2.5 h-1 rounded-sm bg-[#00ff88]/40" />
            </div>
          </div>
        </div>

        {/* App header */}
        <div className="relative z-10 px-2.5 py-1 border-b border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/50" />
            <span className="text-[6px] font-mono text-white/40">BrowserLLM</span>
          </div>
        </div>

        {/* Chat messages */}
        <div className="relative z-10 p-2 space-y-1.5 flex-1 overflow-hidden">
          <AnimatePresence>
            {messages.slice(0, msgIdx).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-2 py-1 rounded-lg text-[5px] font-mono leading-relaxed ${
                    msg.role === "user"
                      ? "bg-white/[0.06] text-white/50 rounded-br-sm"
                      : "border border-white/[0.04] text-[#00ff88]/40 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-2 pb-2">
          <div className="h-5 rounded-full border border-white/[0.06] bg-white/[0.02] flex items-center px-2">
            <span className="text-[5px] font-mono text-white/15">Message...</span>
          </div>
          {/* Home indicator */}
          <div className="mx-auto mt-1.5 w-8 h-[2px] rounded-full bg-white/10" />
        </div>
      </motion.div>
    </div>
  );
}

/* ── Grid layout: 4 rows × full width on lg ──────────────── */
/*
   Row 1: Privacy (3col)  + Offline (1col)     → 4-col grid
   Row 2: WebGPU (1col)   + Models (3col)      → asymmetric
   Row 3: Streaming (2col)+ Zero Cost (2col)   → even split
   Row 4: Cache (2col)    + Mobile (2col)      → even split
*/

const BENTO_ITEMS: {
  title: string;
  desc: string;
  accent: string;
  span: string;
  viz: React.ReactNode;
}[] = [
  {
    title: "Total Privacy",
    desc: "Your conversations never leave your device. No logging, no analytics, no data harvesting.",
    accent: "#00ff88",
    span: "sm:col-span-2 lg:col-span-3",
    viz: <PrivacyViz />,
  },
  {
    title: "Works Offline",
    desc: "After the first model download, everything runs without internet.",
    accent: "#00d4ff",
    span: "sm:col-span-2 lg:col-span-1",
    viz: <OfflineViz />,
  },
  {
    title: "WebGPU Powered",
    desc: "Near-native GPU performance directly in the browser.",
    accent: "#ff6b35",
    span: "sm:col-span-2 lg:col-span-1",
    viz: <WebGPUViz />,
  },
  {
    title: "100+ Model Library",
    desc: "Llama, Qwen, Phi, Gemma, Mistral, DeepSeek and more.",
    accent: "#00d4ff",
    span: "sm:col-span-2 lg:col-span-3",
    viz: <ModelLibraryViz />,
  },
  {
    title: "Streaming Output",
    desc: "Real-time token generation, running locally on your machine.",
    accent: "#00ff88",
    span: "sm:col-span-2 lg:col-span-2",
    viz: <StreamingViz />,
  },
  {
    title: "Zero Cost",
    desc: "No API keys, no subscriptions, no per-token charges.",
    accent: "#ff6b35",
    span: "sm:col-span-2 lg:col-span-2",
    viz: <ZeroCostViz />,
  },
  {
    title: "One-Click Cache",
    desc: "Models are cached in your browser. Reload in seconds.",
    accent: "#00d4ff",
    span: "sm:col-span-2 lg:col-span-2",
    viz: <CacheViz />,
  },
  {
    title: "Mobile Ready",
    desc: "Fully responsive. Install as a PWA and chat on any device, anywhere.",
    accent: "#00ff88",
    span: "sm:col-span-2 lg:col-span-2",
    viz: <MobileViz />,
  },
];

/* ── Bento Grid Section ───────────────────────────────────── */

export function BentoGridSection() {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Why BrowserLLM"
          labelColor="text-[#00ff88]"
          title="Edge AI Without Compromise"
          subtitle="Every feature designed around one principle: your data never leaves your device."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerFast}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {BENTO_ITEMS.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              transition={defaultTransition}
              className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-5 sm:p-6 hover:border-white/[0.12] transition-all duration-500 noise-overlay ${item.span}`}
              style={{ "--bento-card-bg": "rgba(6,6,10,0.6)" } as React.CSSProperties}
            >
              {/* Accent glow on hover */}
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundColor: `${item.accent}12` }}
              />

              {/* Corner accent lines */}
              <div
                className="absolute top-0 left-0 w-12 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ backgroundColor: `${item.accent}40` }}
              />
              <div
                className="absolute top-0 left-0 h-12 w-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ backgroundColor: `${item.accent}40` }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.accent }}
                  />
                  <h3 className="font-display text-[17px] font-semibold text-white tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[13px] text-white/30 leading-relaxed pl-4">
                  {item.desc}
                </p>

                {item.viz}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
