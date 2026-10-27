/**
 * Scrollable message list with auto-scroll and a "scroll to bottom" FAB.
 * Delegates rendering of each message to `MessageBubble`.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import type { Message } from "../../types";
import { MessageBubble } from "./MessageBubble";
import { ArrowDown } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  isGenerating: boolean;
  condensed?: boolean;
  canRevise?: boolean;
  onEditLastUser?: (content: string) => void;
  onRegenerate?: () => void;
}

export function ChatWindow({
  messages,
  isGenerating,
  condensed = false,
  canRevise = false,
  onEditLastUser,
  onRegenerate,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    stickRef.current = true;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Follow the reply only while the user is already at the bottom.
  // scrollTop (not smooth scrollIntoView) so the scroll event doesn't
  // look like the user left the bottom mid-animation.
  useEffect(() => {
    if (!stickRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickRef.current = distFromBottom < 80;
      setShowScrollBtn(distFromBottom > 100);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const lastUser = messages.findLastIndex((item) => item.role === "user");
  const lastAssistant = messages.length - 1;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto px-4 sm:px-6 py-6 space-y-6"
      >
        {condensed && (
          <p className="max-w-3xl mx-auto text-center text-[11px] text-gray-500">
            Earlier messages are condensed in the model's memory.
          </p>
        )}
        {messages.map((msg, i) => {
          return (
            <MessageBubble
              key={i}
              message={msg}
              isStreaming={
                isGenerating &&
                msg.role === "assistant" &&
                i === messages.length - 1
              }
              onEdit={canRevise && i === lastUser ? onEditLastUser : undefined}
              onRegenerate={
                canRevise &&
                i === lastAssistant &&
                msg.role === "assistant" &&
                msg.content
                  ? onRegenerate
                  : undefined
              }
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/[0.1] hover:bg-white/[0.15] border border-white/[0.1] text-gray-300 rounded-full p-2 transition-all shadow-lg backdrop-blur-sm cursor-pointer"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
