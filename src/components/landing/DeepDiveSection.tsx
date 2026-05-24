import { motion } from "framer-motion";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";
import { DEEP_DIVE_ITEMS } from "../../lib/constants";
import { SectionHeader } from "../ui/SectionHeader";

export function DeepDiveSection() {
  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="Under The Hood"
          labelColor="text-[#00ff88]"
          title="What Makes This Possible"
          subtitle="Running billions of parameters inside a browser tab sounds impossible. Here's the engineering that makes it real."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 gap-6"
        >
          {DEEP_DIVE_ITEMS.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              transition={defaultTransition}
              className={`bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-6 sm:p-8 transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-2 h-2 rounded-full ${item.dot} mt-2 shrink-0`}
                />
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    {item.icon}
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
