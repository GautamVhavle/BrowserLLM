import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";
import { SectionHeader } from "../ui/SectionHeader";

const FAQS = [
  {
    q: "How can an AI model run directly in a browser?",
    a: "Modern browsers support WebGPU, a new API that gives web apps direct access to your GPU. Combined with 4-bit quantization that shrinks models by ~8x, and WebAssembly for near-native performance, it's now possible to run models with billions of parameters right in a browser tab.",
  },
  {
    q: "What hardware do I need?",
    a: "A device with a modern GPU that supports WebGPU. Most recent laptops and desktops with Chrome 113+, Edge 113+, or Safari 18.2+ will work. Smaller models (1-3B parameters) run on most machines, while larger models (7B+) need a dedicated GPU with 6+ GB VRAM.",
  },
  {
    q: "Is my data really private?",
    a: "The chat runs on your device and is stored in this browser. It is not sent to a model API. The site can count an anonymous page view, and that count does not include the conversation. After the app and a model are saved, you can disconnect and keep chatting.",
  },
  {
    q: "How does this compare to ChatGPT or Claude?",
    a: "Cloud-based models like GPT-4 or Claude are more powerful for complex reasoning tasks. BrowserLLM trades some capability for complete privacy, zero cost, offline access, and no accounts needed. For many everyday tasks, writing, coding help, brainstorming, local models are more than capable.",
  },
  {
    q: "Do I need to download the model every time?",
    a: "No. Models are cached in your browser's Cache API after the first download. Subsequent visits load the model from local cache in seconds. You can also install BrowserLLM as a PWA for a native app-like experience.",
  },
  {
    q: "Which models are available?",
    a: "About 150 in this build, from SmolLM 135M up to 70B-class models, including Qwen 3.5, Llama 3, Phi, Gemma 3, and Mistral. Gemma 4 is not included yet. You can filter by family, category, size, and hardware.",
  },
  {
    q: "What happens in a long chat?",
    a: "The whole thread stays on screen and in this browser. When it no longer fits the model's context window, older turns are condensed into a short memory so the model can continue. Edit and Regenerate appear after a model is loaded. There is no file upload.",
  },
  {
    q: "Is it really free?",
    a: "Yes, forever. There are no API keys, no subscriptions, no per-token charges. The computation happens on your own GPU. The app is open-source and can be self-hosted.",
  },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={defaultTransition}
      className="border-b border-white/[0.06] last:border-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-6 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="font-display text-base sm:text-lg font-medium text-white group-hover:text-[#00ff88] transition-colors">
          {q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm sm:text-base text-gray-400 leading-relaxed max-w-3xl">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          label="FAQ"
          labelColor="text-[#ff6b35]"
          title="Common Questions"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.01] px-6 sm:px-8"
        >
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
