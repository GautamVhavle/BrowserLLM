import { motion } from "framer-motion";
import { Brain, Cpu, Sparkles } from "lucide-react";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";
import { SectionHeader } from "../ui/SectionHeader";

const TECH_CARDS = [
  {
    icon: <Cpu className="w-8 h-8" />,
    title: "WebGPU",
    accent: "#00d4ff",
    desc: "The next-generation GPU API for the web, standardized by W3C. Provides direct access to your graphics hardware for general-purpose computing, not just rendering triangles.",
    bullets: [
      "Near-native GPU compute performance",
      "Successor to WebGL, designed for ML workloads",
      "Chrome 113+, Edge 113+, Safari 18.2+",
    ],
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "WebLLM",
    accent: "#00ff88",
    desc: "High-performance in-browser LLM inference engine by MLC AI. Compiles models to WebAssembly and executes them via WebGPU with full OpenAI-compatible API.",
    bullets: [
      "18k+ GitHub stars, battle-tested",
      "OpenAI-compatible streaming API",
      "Built on Apache TVM compiler stack",
    ],
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Model Library",
    accent: "#ff6b35",
    desc: "A full model catalog with 100+ models across Llama, Qwen, Phi, Gemma, Mistral, DeepSeek, and more. Filter by category, size, and hardware compatibility, every model runs locally with the same privacy guarantees.",
    bullets: [
      "100+ models from 135M to 70B parameters",
      "Filter by category, VRAM, and hardware tier",
      "One-click download, cached for instant reload",
    ],
  },
];

export function TechStackSection() {
  return (
    <section id="tech" className="py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="The Stack"
          labelColor="text-[#00d4ff]"
          title="Powered By Cutting-Edge Tech"
          subtitle="Three breakthrough technologies make it possible to run real LLMs in your browser with zero backend infrastructure."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6"
        >
          {TECH_CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              transition={defaultTransition}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 hover:border-white/[0.12] transition-all duration-500 noise-overlay"
            >
              {/* Top gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-40"
                style={{ background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }}
              />

              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${card.accent}15`, color: card.accent }}
                >
                  {card.icon}
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  {card.desc}
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  {card.bullets.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: card.accent }}
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
