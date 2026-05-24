import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ChevronRight, ArrowDown, Shield, Globe, Zap, Terminal, Star } from "lucide-react";
import { fadeUp, stagger, heroTransition, blurIn } from "../../lib/animations";
import { useEffect, useState, useCallback } from "react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

interface HeroSectionProps {
  onStart: () => void;
}

/* ── Animated terminal demo ────────────────────────────────── */
const CONVERSATION = [
  { role: "user" as const, text: "Explain how transformers work in neural networks" },
  { role: "ai" as const, text: "Transformers use self-attention mechanisms to weigh the relevance of different parts of the input sequence. Unlike RNNs, they process all tokens in parallel..." },
];

function TerminalDemo() {
  const [charIndex, setCharIndex] = useState(0);
  const aiText = CONVERSATION[1].text;

  useEffect(() => {
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        setCharIndex((prev) => {
          if (prev >= aiText.length) { clearInterval(interval); return prev; }
          return prev + 1;
        });
      }, 22);
      return () => clearInterval(interval);
    }, 2000);
    return () => clearTimeout(delay);
  }, [aiText.length]);

  return (
    <motion.div
      variants={blurIn}
      transition={{ duration: 1, delay: 0.8 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* Ambient glow */}
      <div className="absolute -inset-8 bg-gradient-to-br from-[#00ff88]/8 via-[#00d4ff]/4 to-[#ff6b35]/3 rounded-3xl blur-3xl opacity-60" />

      <div className="relative rounded-xl border border-white/[0.07] bg-[#08080f]/95 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-black/40">
        {/* Title bar */}
        <div className="flex items-center px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.01]">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff5f57]/70" />
            <div className="w-2 h-2 rounded-full bg-[#febc2e]/70" />
            <div className="w-2 h-2 rounded-full bg-[#28c840]/70" />
          </div>
          <span className="text-[10px] text-white/20 font-mono ml-3 tracking-wider">BrowserLLM</span>
          <div className="ml-auto flex items-center gap-1.5 text-[9px] text-[#00ff88]/50 font-mono">
            <span className="w-1 h-1 rounded-full bg-[#00ff88] animate-pulse" />
            local
          </div>
        </div>

        {/* Chat */}
        <div className="p-5 space-y-3 font-mono text-[13px] leading-relaxed">
          <div className="flex gap-3">
            <span className="text-[#00ff88]/60 text-xs shrink-0 mt-0.5 select-none">→</span>
            <span className="text-gray-300/90">{CONVERSATION[0].text}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[#00d4ff]/60 text-xs shrink-0 mt-0.5 select-none">⟵</span>
            <span className="text-gray-500">
              {aiText.slice(0, charIndex)}
              {charIndex < aiText.length && (
                <span className="inline-block w-[2px] h-[14px] bg-[#00ff88]/80 ml-px -mb-[2px] animate-cursor" />
              )}
            </span>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-5 pt-2 border-t border-white/[0.03] text-[10px] text-white/15 font-mono tracking-wide">
            <span>gemma-2b-q4</span>
            <span>42.8 tok/s</span>
            <span>gpu ●</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Aurora background effect ──────────────────────────────── */
function AuroraBackground() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 30 });

  const bg1X = useTransform(springX, [0, 1], ["-10%", "10%"]);
  const bg1Y = useTransform(springY, [0, 1], ["-5%", "5%"]);
  const bg2X = useTransform(springX, [0, 1], ["5%", "-5%"]);
  const bg2Y = useTransform(springY, [0, 1], ["5%", "-10%"]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX / window.innerWidth);
    mouseY.set(e.clientY / window.innerHeight);
  }, [mouseX, mouseY]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        style={{ x: bg1X, y: bg1Y }}
        className="absolute top-[10%] left-[15%] w-[700px] h-[500px] bg-gradient-to-br from-[#00ff88]/[0.04] to-transparent rounded-full blur-[150px]"
      />
      <motion.div
        style={{ x: bg2X, y: bg2Y }}
        className="absolute bottom-[20%] right-[10%] w-[500px] h-[600px] bg-gradient-to-tl from-[#00d4ff]/[0.03] to-transparent rounded-full blur-[130px]"
      />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-[#ff6b35]/[0.02] rounded-full blur-[100px]" />
    </div>
  );
}

/* ── Main hero ─────────────────────────────────────────────── */
export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
      <AuroraBackground />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 max-w-5xl mx-auto w-full"
      >
        {/* ── Title ── */}
        <motion.div variants={fadeUp} transition={heroTransition} className="text-center mb-8">
          <h1 className="leading-[0.85] tracking-[-0.02em]">
            <span className="block font-display text-[clamp(3.5rem,10vw,8rem)] text-white/90">
              Browser
            </span>
            <span className="block font-display italic text-[clamp(5rem,15vw,13rem)] bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent">
              LLM
            </span>
          </h1>
        </motion.div>

        {/* ── Decorative rule ── */}
        <motion.div
          variants={fadeUp}
          transition={heroTransition}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-[11px] font-mono text-white/20 tracking-[0.3em] uppercase">
            edge AI inference in the browser
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/10" />
        </motion.div>

        {/* ── Subtitle ── */}
        <motion.p
          variants={fadeUp}
          transition={heroTransition}
          className="text-center text-lg sm:text-xl md:text-[22px] text-white/40 max-w-xl mx-auto leading-relaxed mb-12 font-light tracking-wide"
        >
          Run <span className="text-white/80 font-normal">100+ open-source models</span> entirely
          in your browser. No servers, no API keys, no data uploaded.
          <br />
          <span className="text-[#00ff88]/60">Pure Edge AI. Works completely offline.</span>
        </motion.p>

        {/* ── CTAs ── */}
        <motion.div
          variants={fadeUp}
          transition={heroTransition}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          <button
            onClick={onStart}
            className="group relative flex items-center gap-2.5 bg-white text-[#06060a] font-semibold px-8 py-3.5 rounded-full hover:bg-white/90 transition-all cursor-pointer text-[15px] tracking-wide"
          >
            <span className="absolute inset-0 rounded-full bg-white/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              Launch App
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
          <a
            href="https://github.com/GautamVhavle/BrowserLLM"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all text-[14px] text-white/50 hover:text-white/80"
          >
            <GithubIcon className="w-4 h-4" />
            <span>Star on GitHub</span>
            <Star className="w-3.5 h-3.5 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors" />
          </a>
        </motion.div>

        {/* ── Terminal ── */}
        <TerminalDemo />

        {/* ── Feature pills ── */}
        <motion.div
          variants={fadeUp}
          transition={{ ...heroTransition, delay: 1.4 }}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {[
            { icon: <Shield className="w-3 h-3" />, text: "Private", accent: "#00ff88" },
            { icon: <Globe className="w-3 h-3" />, text: "Offline", accent: "#00d4ff" },
            { icon: <Zap className="w-3 h-3" />, text: "WebGPU", accent: "#ff6b35" },
            { icon: <Terminal className="w-3 h-3" />, text: "100+ Models", accent: "#ffffff" },
          ].map((pill) => (
            <span
              key={pill.text}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.04] text-[11px] font-mono tracking-wide"
              style={{ color: `${pill.accent}60` }}
            >
              {pill.icon}
              {pill.text}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-6 animate-bounce"
      >
        <ArrowDown className="w-4 h-4 text-white/10" />
      </motion.div>
    </section>
  );
}
