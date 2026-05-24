/**
 * Renders a single chat message in a clean, bubble-free thread layout.
 *
 * - User messages: plain text with "You" label
 * - Assistant messages: rendered Markdown with model name label + metadata
 * - Metadata row: model name · tok/s · gen time (click for full stats modal)
 * - Copy button on hover
 * - Each message fades in with a subtle animation
 */
import { useState, memo } from "react";
import { createPortal } from "react-dom";
import type { Message } from "../../types";
import { Sparkles, User, Copy, Check, Zap, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { StatsModal } from "./StatsPanel";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"code"> & { className?: string }) {
  const match = /language-(\w+)/.exec(className || "");
  const isInline = !match && !String(children).includes("\n");

  if (isInline) {
    return (
      <code
        className="bg-white/[0.06] text-purple-300 px-1.5 py-0.5 rounded text-[13px] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group/code my-3">
      {match && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border border-white/[0.06] border-b-0 rounded-t-lg">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
            {match[1]}
          </span>
          <CopyCodeButton text={String(children).replace(/\n$/, "")} />
        </div>
      )}
      <pre
        className={`bg-white/[0.02] border border-white/[0.06] overflow-x-auto text-[13px] leading-relaxed ${
          match ? "rounded-b-lg pt-3 pb-3 px-4" : "rounded-lg p-4"
        }`}
      >
        <code className="font-mono text-gray-300" {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-gray-600 hover:text-gray-300 transition-colors p-0.5 rounded cursor-pointer"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-message-in max-w-3xl mx-auto w-full">
      {isUser ? (
        /* ── User message — right-aligned ── */
        <div className="flex items-start gap-3 flex-row-reverse">
          <div className="w-6 h-6 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-3 h-3 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5 text-right">
            <p className="text-[11px] font-medium text-gray-500 mb-1">You</p>
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        </div>
      ) : (
        /* ── Assistant message ── */
        <div className="group flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-cyan-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[11px] font-medium text-gray-500 mb-1">
              {message.modelName ?? "BrowserAI"}
            </p>

            {/* Content */}
            {message.content ? (
              <div className="text-sm text-gray-300 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeBlock,
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-semibold text-white mt-5 mb-2 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-semibold text-white mt-4 mb-2 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold text-white mt-3 mb-1.5 first:mt-0">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside ml-4 mb-3 space-y-1 last:mb-0">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-outside ml-4 mb-3 space-y-1 last:mb-0">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-300 pl-1">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-purple-500/30 pl-3 my-3 text-gray-400 italic">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
                      >
                        {children}
                      </a>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="w-full text-sm border-collapse">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-white/[0.03]">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="text-left px-3 py-2 text-gray-300 font-medium border-b border-white/[0.06]">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 border-b border-white/[0.04] text-gray-400">
                        {children}
                      </td>
                    ),
                    hr: () => <hr className="border-white/[0.06] my-4" />,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-200">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-400">{children}</em>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse align-text-bottom rounded-sm" />
                )}
              </div>
            ) : null}

            {/* Thinking indicator */}
            {isStreaming && !message.content && (
              <div className="flex items-center gap-1.5 py-1">
                <span className="text-xs text-gray-500">Thinking</span>
                <span className="flex gap-1">
                  <span className="w-1 h-1 bg-purple-400/60 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-purple-400/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-1 bg-purple-400/60 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            )}

            {/* Metadata row */}
            {message.content && !isStreaming && (
              <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-600">
                {message.stats ? (
                  <button
                    onClick={() => setShowStats(true)}
                    className="flex items-center gap-1.5 hover:text-gray-400 transition-colors cursor-pointer rounded-md px-1.5 py-0.5 -ml-1.5 hover:bg-white/[0.03]"
                    title="View generation stats"
                  >
                    <Zap className="w-2.5 h-2.5 text-yellow-500/50" />
                    <span>
                      {message.stats.tokensPerSecond.toFixed(1)} tok/s
                    </span>
                    <span className="text-gray-700">·</span>
                    <span>
                      {(message.stats.generationTimeMs / 1000).toFixed(1)}s
                    </span>
                    <ChevronRight className="w-2.5 h-2.5 text-gray-700" />
                  </button>
                ) : null}

                <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-300 transition-all p-0.5 rounded cursor-pointer"
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats modal — portaled to body to escape stacking contexts */}
      {message.stats && showStats &&
        createPortal(
          <StatsModal
            stats={message.stats}
            open={showStats}
            onClose={() => setShowStats(false)}
            modelName={message.modelName}
          />,
          document.body
        )}
    </div>
  );
});
