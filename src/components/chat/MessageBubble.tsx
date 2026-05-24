/**
 * Renders a single chat message.
 *
 * - **User messages** are displayed as plain text in a purple bubble.
 * - **Assistant messages** are rendered as Markdown (via `react-markdown`)
 *   with custom components for code blocks, tables, blockquotes, etc.
 * - Supports streaming state: "Thinking" dots when empty, pulsing cursor while generating.
 * - Copy-to-clipboard on hover for assistant messages and code blocks.
 *
 * Wrapped in `React.memo` to avoid re-rendering unchanged messages.
 */
import { useState, memo } from "react";
import type { Message } from "../../types";
import { Sparkles, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function CodeBlock({ className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { className?: string }) {
  const match = /language-(\w+)/.exec(className || "");
  const isInline = !match && !String(children).includes("\n");

  if (isInline) {
    return (
      <code
        className="bg-white/[0.08] text-purple-300 px-1.5 py-0.5 rounded text-[13px] font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group/code my-2">
      {match && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-1.5 bg-white/[0.04] border-b border-white/[0.06] rounded-t-lg">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">{match[1]}</span>
          <CopyCodeButton text={String(children).replace(/\n$/, "")} />
        </div>
      )}
      <pre className={`bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-x-auto text-[13px] leading-relaxed ${match ? "pt-9 pb-3 px-4" : "p-4"}`}>
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
      className="text-gray-500 hover:text-gray-300 transition-colors p-0.5 rounded cursor-pointer opacity-0 group-hover/code:opacity-100"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export const MessageBubble = memo(function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex gap-3 max-w-3xl mx-auto w-full ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
          isUser
            ? "bg-purple-500/20 text-purple-400"
            : "bg-cyan-500/20 text-cyan-400"
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0 max-w-[90%] sm:max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-purple-500/15 text-gray-100 rounded-tr-md whitespace-pre-wrap break-words"
              : "bg-white/[0.04] text-gray-300 rounded-tl-md border border-white/[0.06]"
          }`}
        >
          {isUser ? (
            message.content
          ) : message.content ? (
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                  h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-4 mb-2 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold text-white mt-3 mb-2 first:mt-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold text-white mt-3 mb-1.5 first:mt-0">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-300">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-purple-500/40 pl-3 my-2 text-gray-400 italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="w-full text-sm border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-white/[0.04]">{children}</thead>,
                  th: ({ children }) => <th className="text-left px-3 py-1.5 text-gray-300 font-medium border border-white/[0.08]">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-1.5 border border-white/[0.06] text-gray-400">{children}</td>,
                  hr: () => <hr className="border-white/[0.08] my-4" />,
                  strong: ({ children }) => <strong className="font-semibold text-gray-200">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-400">{children}</em>,
                }}
              />
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse align-text-bottom" />
              )}
            </div>
          ) : null}
          {isStreaming && !message.content && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-xs text-purple-400/70 mr-1">Thinking</span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.3s]" />
            </span>
          )}
        </div>

        {/* Actions */}
        {!isUser && message.content && !isStreaming && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded cursor-pointer"
              title="Copy"
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
  );
});
