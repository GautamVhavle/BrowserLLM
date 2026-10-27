/**
 * localStorage persistence layer for chats, active chat ID, and custom models.
 *
 * All functions are synchronous and fail silently if storage is unavailable
 * (e.g. quota exceeded, private browsing restrictions).
 *
 * Storage keys:
 *   browserai-chats         , JSON array of ChatSession
 *   browserai-active-chat   , Active chat UUID
 *   browserai-custom-models , JSON array of user-added model IDs
 */
import type { ChatSession, ConversationMemory, Message } from "../types";

const STORAGE_KEY = "browserai-chats";
const ACTIVE_CHAT_KEY = "browserai-active-chat";

export function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeLocal(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function removeSession(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Load all chat sessions from localStorage. */
export function loadAllChats(): ChatSession[] {
  try {
    const raw = readLocal(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((chat): ChatSession[] => {
      if (!chat || typeof chat !== "object") return [];
      const row = chat as Partial<ChatSession>;
      if (typeof row.id !== "string" || !Array.isArray(row.messages)) return [];
      const messages = row.messages.filter(
        (message): message is Message =>
          !!message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string",
      );
      const memory = readMemory(row.memory);
      return [{
        id: row.id,
        title: typeof row.title === "string" ? row.title : "New Chat",
        modelId: typeof row.modelId === "string" ? row.modelId : "",
        messages,
        ...(memory ? { memory } : {}),
        createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now(),
        updatedAt: typeof row.updatedAt === "number" ? row.updatedAt : Date.now(),
      }];
    });
  } catch {
    return [];
  }
}

function readMemory(value: unknown): ConversationMemory | undefined {
  if (!value || typeof value !== "object") return undefined;
  const row = value as Partial<ConversationMemory>;
  if (typeof row.summary !== "string" || !row.summary.trim()) return undefined;
  if (typeof row.coveredCount !== "number" || row.coveredCount < 0) return undefined;
  return { summary: row.summary, coveredCount: Math.floor(row.coveredCount) };
}

/** Persist all chat sessions. Returns false when the write was rejected. */
export function saveAllChats(chats: ChatSession[]): boolean {
  return writeLocal(STORAGE_KEY, JSON.stringify(chats));
}

/** Save a single chat (insert or update). */
export function saveChat(chat: ChatSession): void {
  const chats = loadAllChats();
  const idx = chats.findIndex((c) => c.id === chat.id);
  if (idx >= 0) {
    chats[idx] = chat;
  } else {
    chats.unshift(chat);
  }
  saveAllChats(chats);
}

/** Delete a chat by ID. */
export function deleteChat(id: string): void {
  const chats = loadAllChats().filter((c) => c.id !== id);
  saveAllChats(chats);
}

export function getChat(id: string): ChatSession | null {
  return loadAllChats().find((c) => c.id === id) ?? null;
}

export function loadActiveChatId(): string | null {
  return readLocal(ACTIVE_CHAT_KEY);
}

export function saveActiveChatId(id: string | null): void {
  if (id) writeLocal(ACTIVE_CHAT_KEY, id);
  else removeLocal(ACTIVE_CHAT_KEY);
}

/** Generate a unique chat ID using `crypto.randomUUID()`. */
export function generateChatId(): string {
  return crypto.randomUUID();
}

/** Auto-generate a chat title from the first user message (truncated to ~50 chars). */
export function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  if (!trimmed) return "New Chat";
  if (trimmed.length <= 50) return trimmed;
  const cut = trimmed.slice(0, 50);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut) + "…";
}

// --- Custom Models ---

export interface CustomModel {
  id: string;
  name: string;
  addedAt: number;
}

const CUSTOM_MODELS_KEY = "browserai-custom-models";

export function loadCustomModels(): CustomModel[] {
  try {
    const raw = readLocal(CUSTOM_MODELS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveCustomModel(model: CustomModel): void {
  const models = loadCustomModels();
  if (!models.some((m) => m.id === model.id)) {
    models.push(model);
    writeLocal(CUSTOM_MODELS_KEY, JSON.stringify(models));
  }
}

export function deleteCustomModel(id: string): void {
  const models = loadCustomModels().filter((m) => m.id !== id);
  writeLocal(CUSTOM_MODELS_KEY, JSON.stringify(models));
}

// --- Default Model ---

const DEFAULT_MODEL_KEY = "browserai-default-model";

export function loadDefaultModelId(): string | null {
  return readLocal(DEFAULT_MODEL_KEY);
}

export function saveDefaultModelId(id: string): void {
  writeLocal(DEFAULT_MODEL_KEY, id);
}

export function clearDefaultModelId(): void {
  removeLocal(DEFAULT_MODEL_KEY);
}
