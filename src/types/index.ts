/**
 * Shared TypeScript interfaces used across the application.
 * All data shapes for messages, sessions, stats, and downloads are defined here.
 */

/** A file attached to a message (images for vision models). */
export interface Attachment {
  type: "image" | "pdf";
  name: string;
  /** base64-encoded data URL (e.g. `data:image/png;base64,...`) */
  dataUrl: string;
  mimeType: string;
}

/** A single chat message, either from the user or the assistant. */
export interface Message {
  role: "user" | "assistant";
  content: string;
  /** Optional file attachments (only supported by vision models). */
  attachments?: Attachment[];
  /** Stats captured after this assistant message was generated. */
  stats?: GenerationStats;
  /** Name of the model that generated this response. */
  modelName?: string;
}

/** Progress reported during model download/initialization. */
export interface LoadingProgress {
  text: string;
  /** 0-1 fraction representing completion. */
  progress: number;
}

/** Statistics collected after each generation completes. */
export interface GenerationStats {
  /** Number of tokens the model generated (completion tokens). */
  tokensGenerated: number;
  /** Total tokens used (prompt + completion). */
  totalTokens: number;
  /** Number of tokens in the prompt (user + system). */
  promptTokens: number;
  /** Generation speed in tokens per second. */
  tokensPerSecond: number;
  /** How many tokens of the context window are currently used. */
  contextUsed: number;
  /** Maximum context window size for the loaded model. */
  contextTotal: number;
  /** Approximate tokens consumed by the system prompt. */
  systemPromptTokens: number;
  /** Wall-clock time for the generation in milliseconds. */
  generationTimeMs: number;
}

/** Tracks a model being downloaded in the background. */
export interface BackgroundDownload {
  modelId: string;
  modelName: string;
  /** 0-1 fraction representing download progress. */
  progress: number;
  /** Human-readable status text from the download. */
  text: string;
  status: "downloading" | "completed" | "cancelled" | "error";
  error?: string;
}

/** A single chat conversation persisted to localStorage. */
export interface ChatSession {
  id: string;
  title: string;
  /** The WebLLM model ID associated with this chat. */
  modelId: string;
  messages: Message[];
  /** Unix timestamp (ms) when the chat was created. */
  createdAt: number;
  /** Unix timestamp (ms) of the last update. */
  updatedAt: number;
}
