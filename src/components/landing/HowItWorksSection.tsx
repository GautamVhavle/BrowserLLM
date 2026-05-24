import { motion } from "framer-motion";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";
import { HOW_IT_WORKS_STEPS } from "../../lib/constants";
import { SectionHeader } from "../ui/SectionHeader";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="Architecture"
          labelColor="text-[#00d4ff]"
          title="How It Actually Works"
          subtitle="No smoke and mirrors. Here's the real pipeline that lets a language model run at native speed inside a browser tab."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6"
        >
          {HOW_IT_WORKS_STEPS.map((item, idx) => {
            const accents = ["#00ff88", "#00d4ff", "#ff6b35"];
            const accent = accents[idx % accents.length];
            return (
              <motion.div
                key={item.step}
                variants={fadeUp}
                transition={defaultTransition}
                className="relative group"
              >
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8 h-full hover:border-white/[0.12] transition-all duration-500 noise-overlay">
                  <div className="text-5xl font-black text-white/[0.03] absolute top-4 right-6 font-display">
                    {item.step}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {item.desc}
                  </p>
                  <p className="text-xs text-gray-600 border-t border-white/[0.04] pt-3 font-mono">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
