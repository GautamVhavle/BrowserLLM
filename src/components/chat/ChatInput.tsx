/**
 * Chat input bar with auto-resizing textarea, model selector trigger,
 * multimodal attachment button, and submit/stop controls.
 *
 * The attachment (paperclip) button is only active when the loaded model
 * supports vision. For text-only models it's greyed out with a tooltip.
 */
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { ArrowUp, Square, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  isGenerating: boolean;
  onStop: () => void;
  placeholder?: string;
  supportsVision?: boolean;
}

export function ChatInput({
  onSend,
  disabled,
  isGenerating,
  onStop,
  placeholder,
  supportsVision = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2 sm:p-3 relative z-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden focus-within:border-purple-500/30 transition-colors">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? "Type a message..."}
            disabled={disabled && !isGenerating}
            rows={1}
            className="w-full resize-none bg-transparent text-gray-200 placeholder-gray-600 px-3 sm:px-4 pt-3 pb-1 text-[16px] sm:text-sm focus:outline-none disabled:opacity-50"
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-2 pb-2">
            {/* Left: Attachment + Model indicator */}
            <div className="flex items-center gap-1">
              {/* Attachment button */}
              <div className="relative group/attach">
                <button
                  disabled={!supportsVision}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    supportsVision
                      ? "text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]"
                      : "text-gray-600 cursor-not-allowed opacity-40"
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                {!supportsVision && (
                  <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-800 text-[10px] text-gray-300 rounded-lg whitespace-nowrap opacity-0 group-hover/attach:opacity-100 transition-opacity pointer-events-none border border-white/[0.08] shadow-lg">
                    Not supported by this model
                  </div>
                )}
              </div>
            </div>

            {/* Right: Submit / Stop */}
            {isGenerating ? (
              <button
                onClick={onStop}
                className="bg-white/[0.1] hover:bg-white/[0.15] text-gray-300 p-2 rounded-lg transition-all cursor-pointer"
                title="Stop generating"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={disabled || !input.trim()}
                className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
