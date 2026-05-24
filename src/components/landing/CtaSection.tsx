import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";

interface CtaSectionProps {
  onStart: () => void;
}

export function CtaSection({ onStart }: CtaSectionProps) {
  return (
    <section className="py-24 sm:py-32 px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="max-w-3xl mx-auto text-center relative"
      >
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00ff88]/5 rounded-full blur-[120px]" />
        </div>

        <motion.h2
          variants={fadeUp}
          transition={defaultTransition}
          className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-6"
        >
          Ready to chat with AI
          <br />
          <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
            running on your machine?
          </span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          transition={defaultTransition}
          className="text-gray-400 mb-10 max-w-lg mx-auto px-2"
        >
          Pick from 100+ models, click load, and start a fully private conversation.
          No sign-up. No API keys. No data leaves your device. Works offline.
        </motion.p>
        <motion.div variants={fadeUp} transition={defaultTransition}>
          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 bg-white text-[#06060a] font-semibold px-10 py-4 rounded-full hover:bg-white/90 transition-all cursor-pointer text-base tracking-wide"
          >
            <span className="absolute inset-0 rounded-full bg-white/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-3">
              Launch BrowserLLM
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
