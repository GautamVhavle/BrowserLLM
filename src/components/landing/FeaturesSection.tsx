import { motion } from "framer-motion";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";
import { FEATURES } from "../../lib/constants";
import { SectionHeader } from "../ui/SectionHeader";

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="Why BrowserLLM"
          labelColor="text-pink-400"
          title="AI Without Compromise"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              transition={defaultTransition}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-4 text-gray-300">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
