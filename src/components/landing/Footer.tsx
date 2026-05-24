import { Brain, Heart, Star, Shield, Globe } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] pt-16 pb-8 px-6" role="contentinfo">
      <div className="max-w-6xl mx-auto">
        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Brain className="w-5 h-5 text-[#00ff88]" aria-hidden="true" />
              <span className="font-display text-lg text-white/90 font-semibold">BrowserLLM</span>
            </div>
            <p className="text-[13px] text-white/30 leading-relaxed max-w-[260px] mb-5">
              Run AI models entirely in your browser. No servers, no tracking, no compromises on privacy.
            </p>
            <a
              href="https://github.com/GautamVhavle/BrowserLLM"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all text-xs text-white/40 hover:text-white/70"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              Star on GitHub
              <Star className="w-3 h-3 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors" />
            </a>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-mono text-white/50 tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><a href="/models" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Model Library</a></li>
              <li><a href="/chat" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Chat</a></li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-white/30">
                  <Shield className="w-3 h-3 text-[#00ff88]/50" />
                  100% Private
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-white/30">
                  <Globe className="w-3 h-3 text-[#00d4ff]/50" />
                  Works Offline
                </span>
              </li>
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h4 className="text-xs font-mono text-white/50 tracking-wider uppercase mb-4">Open Source</h4>
            <ul className="space-y-2.5">
              <li><a href="https://github.com/GautamVhavle/BrowserLLM" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Source Code</a></li>
              <li><a href="https://github.com/GautamVhavle/BrowserLLM/issues" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Report a Bug</a></li>
              <li><a href="https://github.com/GautamVhavle/BrowserLLM/pulls" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Contribute</a></li>
              <li><a href="https://github.com/GautamVhavle/BrowserLLM/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">MIT License</a></li>
            </ul>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-xs font-mono text-white/50 tracking-wider uppercase mb-4">Built With</h4>
            <ul className="space-y-2.5">
              <li><a href="https://github.com/mlc-ai/web-llm" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">WebLLM (MLC-AI)</a></li>
              <li><a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">React 19</a></li>
              <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">WebGPU</a></li>
              <li><a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Tailwind CSS v4</a></li>
            </ul>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-6" />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/20 font-mono">
          <p className="flex items-center gap-1.5">
            &copy; {year} BrowserLLM &middot; Made with{" "}
            <Heart className="w-3 h-3 text-red-500/70 fill-red-500/70 inline" aria-hidden="true" />{" "}
            by Gautam Vhavle
          </p>
          <p className="tracking-wider">
            Free &amp; open source &middot; MIT Licensed
          </p>
        </div>
      </div>
    </footer>
  );
}
