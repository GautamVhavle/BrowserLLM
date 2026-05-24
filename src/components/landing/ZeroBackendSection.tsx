import { motion } from "framer-motion";
import { fadeUp, stagger, defaultTransition } from "../../lib/animations";
import { SectionHeader } from "../ui/SectionHeader";
import { ServerOff, Wifi, WifiOff, Code2, Lock, Cpu } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const FACTS = [
  {
    icon: <ServerOff className="w-5 h-5" />,
    title: "Zero Servers",
    desc: "No backend. No API. No cloud functions. This entire app is a static site served from the edge. There is literally nothing to hack.",
    accent: "#ff6b35",
  },
  {
    icon: <WifiOff className="w-5 h-5" />,
    title: "Works Offline",
    desc: "Disconnect your internet. The app still works. Models run on YOUR GPU via WebGPU. Your data never touches a wire.",
    accent: "#00d4ff",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: "True Edge AI",
    desc: "AI inference happens at the edge - your device. No round-trips to data centers, no latency, no metered API calls. This is what AI was supposed to be.",
    accent: "#00ff88",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Unbreakable Privacy",
    desc: "We can't see your data even if we wanted to. There's no server to log to, no database to query, no analytics pipeline. Mathematically private.",
    accent: "#a78bfa",
  },
  {
    icon: <Wifi className="w-5 h-5" />,
    title: "No API Keys, Ever",
    desc: "No sign-ups, no tokens, no rate limits, no billing. Open the site and start chatting with AI. That's it. Forever free.",
    accent: "#facc15",
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    title: "100% Open Source",
    desc: "Every line of code is on GitHub. Fork it, audit it, self-host it, improve it. MIT Licensed. No strings attached.",
    accent: "#f472b6",
  },
];

export function ZeroBackendSection() {
  return (
    <section className="py-24 sm:py-32 px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-[#ff6b35]/[0.04] via-[#00ff88]/[0.03] to-[#00d4ff]/[0.04] rounded-full blur-[180px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <SectionHeader
          label="Zero Backend"
          labelColor="text-[#ff6b35]"
          title="This Website Has No Server"
          subtitle="Read that again. There is no backend, no database, no API server. Every byte of AI runs on your device. This is Edge AI in its purest form."
        />

        {/* Highlight banner */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={defaultTransition}
          className="mb-14 relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35]/20 via-[#00ff88]/20 to-[#00d4ff]/20 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8 text-center backdrop-blur-sm">
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-3xl mx-auto font-light">
              Most "AI apps" are just fancy wrappers around someone else's API.
              <span className="text-white font-medium"> BrowserLLM is different.</span>{" "}
              The model downloads once, runs on your GPU, and every conversation happens{" "}
              <span className="text-[#00ff88] font-semibold">entirely inside your browser tab</span>.
              No request ever leaves your machine.
            </p>
          </div>
        </motion.div>

        {/* Facts grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
        >
          {FACTS.map((fact) => (
            <motion.div
              key={fact.title}
              variants={fadeUp}
              transition={defaultTransition}
              className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-500"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300"
                style={{
                  background: `${fact.accent}10`,
                  color: `${fact.accent}`,
                }}
              >
                {fact.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{fact.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{fact.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Open source callout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={defaultTransition}
          className="text-center"
        >
          <p className="text-xs font-mono text-white/25 tracking-wider mb-4">
            DON'T TRUST US. VERIFY IT YOURSELF.
          </p>
          <a
            href="https://github.com/GautamVhavle/BrowserLLM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all text-sm text-white/50 hover:text-white/80"
          >
            <GithubIcon className="w-4 h-4" />
            View the entire source code
          </a>
        </motion.div>
      </div>
    </section>
  );
}
