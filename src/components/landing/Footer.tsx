import { Brain, Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2 font-display font-semibold">
          <Brain className="w-4 h-4 text-[#00ff88]" />
          <span>BrowserLLM</span>
        </div>
        <p className="flex items-center gap-1 font-mono text-xs">
          &copy; {year} Made with{" "}
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />{" "}
          by Gautam Vhavle
        </p>
      </div>
    </footer>
  );
}
