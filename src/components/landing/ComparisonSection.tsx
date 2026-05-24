import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";
import { SectionHeader } from "../ui/SectionHeader";

const COMPARISON = [
  {
    feature: "Data Privacy",
    browserai: { value: "100% local, nothing leaves your device", status: "yes" as const },
    chatgpt: { value: "Processed on OpenAI servers", status: "no" as const },
    ollama: { value: "Local processing", status: "yes" as const },
  },
  {
    feature: "Setup Required",
    browserai: { value: "Zero, just open the link", status: "yes" as const },
    chatgpt: { value: "Account + subscription", status: "partial" as const },
    ollama: { value: "CLI install + model download", status: "partial" as const },
  },
  {
    feature: "Runs in Browser",
    browserai: { value: "Fully in-browser", status: "yes" as const },
    chatgpt: { value: "Browser UI, cloud backend", status: "partial" as const },
    ollama: { value: "Separate process required", status: "no" as const },
  },
  {
    feature: "Offline Mode",
    browserai: { value: "Full offline after first load", status: "yes" as const },
    chatgpt: { value: "Requires internet", status: "no" as const },
    ollama: { value: "Works offline", status: "yes" as const },
  },
  {
    feature: "Cost",
    browserai: { value: "Free forever", status: "yes" as const },
    chatgpt: { value: "$20/mo or per-token API", status: "no" as const },
    ollama: { value: "Free", status: "yes" as const },
  },
  {
    feature: "Cross-Platform",
    browserai: { value: "Any device with a modern browser", status: "yes" as const },
    chatgpt: { value: "Web + mobile apps", status: "yes" as const },
    ollama: { value: "macOS, Linux, Windows", status: "partial" as const },
  },
  {
    feature: "No Install",
    browserai: { value: "Zero installation", status: "yes" as const },
    chatgpt: { value: "No install for web", status: "yes" as const },
    ollama: { value: "Requires CLI install", status: "no" as const },
  },
  {
    feature: "Model Library",
    browserai: { value: "100+ models, browse & filter", status: "yes" as const },
    chatgpt: { value: "Vendor-locked models", status: "partial" as const },
    ollama: { value: "Pull from registry", status: "yes" as const },
  },
];

function StatusIcon({ status }: { status: "yes" | "no" | "partial" }) {
  if (status === "yes") return <Check className="w-4 h-4 text-[#00ff88]" />;
  if (status === "no") return <X className="w-4 h-4 text-red-400/70" />;
  return <Minus className="w-4 h-4 text-yellow-400/70" />;
}

export function ComparisonSection() {
  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          label="Comparison"
          labelColor="text-[#ff6b35]"
          title="How BrowserLLM Stacks Up"
          subtitle="See how running AI directly in your browser compares to cloud services and local installations."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            transition={defaultTransition}
            className="overflow-x-auto -mx-6 px-6"
          >
            <div className="inline-block min-w-full">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-4 px-3 sm:px-4 text-gray-500 font-medium min-w-[120px]">
                      Feature
                    </th>
                    <th className="text-center py-4 px-3 sm:px-4 min-w-[140px]">
                      <span className="text-[#00ff88] font-bold font-display">
                        BrowserLLM
                      </span>
                    </th>
                    <th className="text-center py-4 px-3 sm:px-4 text-gray-400 font-medium min-w-[140px]">
                      ChatGPT
                    </th>
                    <th className="text-center py-4 px-3 sm:px-4 text-gray-400 font-medium min-w-[140px]">
                      Ollama
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-3 sm:px-4 text-gray-300 font-medium text-xs sm:text-sm">
                        {row.feature}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <StatusIcon status={row.browserai.status} />
                          <span className="text-[10px] sm:text-xs text-gray-400">
                            {row.browserai.value}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <StatusIcon status={row.chatgpt.status} />
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {row.chatgpt.value}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <StatusIcon status={row.ollama.status} />
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {row.ollama.value}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
