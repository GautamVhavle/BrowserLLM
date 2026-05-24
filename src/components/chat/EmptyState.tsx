/**
 * Shown when a chat has no messages yet.
 * Displays the loaded model info and clickable suggestion chips.
 */
import { MessageSquare, Sparkles } from "lucide-react";
import { getModelById } from "../../lib/models";

interface EmptyStateProps {
  modelId: string;
  onSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a haiku about programming",
  "What are the benefits of TypeScript?",
  "Help me debug a React component",
];

export function EmptyState({ modelId, onSuggestion }: EmptyStateProps) {
  const model = getModelById(modelId);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">
            Start a conversation
          </h2>
          <p className="text-sm text-gray-500">
            {model
              ? `Chat with ${model.name} (${model.parameterCount}) running locally in your browser`
              : "Send a message to begin"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full">
          {SUGGESTIONS.map((text) => (
            <button
              key={text}
              onClick={() => onSuggestion(text)}
              className="text-left text-xs text-gray-400 hover:text-gray-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] rounded-xl px-3 py-2.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-purple-400 mb-1" />
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
