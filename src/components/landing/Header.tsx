import { useScroll, useMotionValueEvent } from "framer-motion";
import { Star, Menu, X } from "lucide-react";
import { useState } from "react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Models", id: "models" },
  { label: "Comparison", id: "comparison" },
  { label: "Tech Stack", id: "tech" },
  { label: "FAQ", id: "faq" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 64; // header height + breathing room
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

interface HeaderProps {
  onStart: () => void;
}

export function Header({ onStart }: HeaderProps) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#06060a]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* ── Brand ── */}
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="BrowserLLM"
              className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-display text-[15px] font-semibold text-white/80 group-hover:text-white transition-colors tracking-tight">
              BrowserLLM
            </span>
          </a>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="px-3 py-1.5 text-[13px] text-white/35 hover:text-white/75 hover:bg-white/[0.04] rounded-lg transition-all cursor-pointer font-medium"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://github.com/GautamVhavle/BrowserLLM"
              target="_blank"
              rel="noopener noreferrer"
              className="group hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-white/35 hover:text-white/75 hover:bg-white/[0.04] transition-all font-medium"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">GitHub</span>
              <Star className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-all" />
            </a>
            <button
              onClick={onStart}
              className="px-4 py-1.5 rounded-full bg-white text-[#06060a] hover:bg-white/90 text-[13px] font-semibold transition-all cursor-pointer"
            >
              Launch App
            </button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#06060a]/95 backdrop-blur-xl px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => { scrollToSection(link.id); setMobileOpen(false); }}
              className="text-left px-3 py-2.5 text-[14px] text-white/50 hover:text-white/80 hover:bg-white/[0.04] rounded-lg transition-all cursor-pointer font-medium"
            >
              {link.label}
            </button>
          ))}
          <div className="h-px bg-white/[0.06] my-2" />
          <a
            href="https://github.com/GautamVhavle/BrowserLLM"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 text-[14px] text-white/50 hover:text-white/80 hover:bg-white/[0.04] rounded-lg transition-all font-medium"
          >
            <GithubIcon className="w-4 h-4" />
            GitHub
          </a>
        </div>
      )}
    </header>
  );
}
