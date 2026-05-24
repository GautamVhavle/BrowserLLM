import { useScroll, useMotionValueEvent } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

interface HeaderProps {
  onStart: () => void;
}

export function Header({ onStart }: HeaderProps) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#06060a]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* ── Brand ── */}
          <a href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="BrowserLLM"
              className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-display text-[15px] font-semibold text-white/80 group-hover:text-white transition-colors tracking-tight">
              BrowserLLM
            </span>
          </a>

          {/* ── Nav links ── */}
          <nav className="hidden sm:flex items-center gap-6">
            <a
              href="/models"
              className="text-[13px] text-white/35 hover:text-white/70 transition-colors font-medium"
            >
              Models
            </a>
            <a
              href="https://github.com/GautamVhavle/BrowserLLM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-white/35 hover:text-white/70 transition-colors font-medium"
            >
              Docs
            </a>
            <a
              href="https://github.com/GautamVhavle/BrowserLLM"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-[13px] text-white/35 hover:text-white/70 transition-colors font-medium"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              GitHub
              <Star className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-all" />
            </a>
          </nav>

          {/* ── CTA ── */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/GautamVhavle/BrowserLLM"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden text-white/35 hover:text-white/70 transition-colors p-1.5"
              aria-label="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <button
              onClick={onStart}
              className="px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] hover:border-white/[0.15] text-[13px] font-medium text-white/70 hover:text-white transition-all cursor-pointer"
            >
              Launch App
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
