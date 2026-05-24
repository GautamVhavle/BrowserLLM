import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";
import { getRecommendedModels, CATEGORY_LABELS } from "../../lib/modelCatalog";
import { SectionHeader } from "../ui/SectionHeader";
import { Cpu, HardDrive, Layers, Box, Star, ArrowRight } from "lucide-react";

export function ModelsSection() {
  const navigate = useNavigate();
  const recommended = getRecommendedModels();

  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="Models"
          labelColor="text-[#ff6b35]"
          title="100+ Models Ready to Run"
          subtitle="From tiny 135M models to 70B powerhouses. Every model runs entirely in your browser."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {recommended.map((model) => (
            <motion.div
              key={model.id}
              variants={fadeUp}
              transition={defaultTransition}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-500 noise-overlay"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 text-[#00d4ff]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white truncate">
                      {model.name}
                    </h3>
                    <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500">{model.provider}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                {model.description}
              </p>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {model.categories.map((cat) => (
                  <span
                    key={cat}
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      cat === "uncensored"
                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                        : "text-gray-400 bg-white/[0.04] border-white/[0.08]"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <Layers className="w-3 h-3 text-purple-400" />
                  <span>{model.parameterCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <HardDrive className="w-3 h-3 text-cyan-400" />
                  <span>{(model.vramRequired / 1024).toFixed(1)} GB</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <Box className="w-3 h-3 text-green-400" />
                  <span>{model.quantization}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <Layers className="w-3 h-3 text-orange-400" />
                  <span>{model.contextWindow >= 1024 ? `${(model.contextWindow / 1024).toFixed(0)}K` : model.contextWindow} ctx</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Browse all models callout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={defaultTransition}
          className="gradient-border rounded-2xl p-6 sm:p-8 text-center"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            Browse All 100+ Models
          </h3>
          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed mb-4">
            Llama, Qwen, Phi, Gemma, Mistral, DeepSeek, Hermes, and more.
            Filter by category, hardware requirements, and compatibility with your device.
          </p>
          <button
            onClick={() => navigate("/models")}
            className="inline-flex items-center justify-center gap-1.5 text-sm text-[#00ff88] font-mono hover:text-[#00ff88]/80 transition-colors cursor-pointer"
          >
            <span>Explore in the Model Library</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
