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
import type { ChatSession } from "../types";

const STORAGE_KEY = "browserai-chats";
const ACTIVE_CHAT_KEY = "browserai-active-chat";

/** Load all chat sessions from localStorage. */
export function loadAllChats(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/** Persist all chat sessions (overwrites the full list). */
export function saveAllChats(chats: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch {
    // localStorage full, silently fail
  }
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
  try {
    return localStorage.getItem(ACTIVE_CHAT_KEY);
  } catch {
    return null;
  }
}

export function saveActiveChatId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CHAT_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  } catch {
    // ignore
  }
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
    const raw = localStorage.getItem(CUSTOM_MODELS_KEY);
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
    try {
      localStorage.setItem(CUSTOM_MODELS_KEY, JSON.stringify(models));
    } catch {
      // localStorage full
    }
  }
}

export function deleteCustomModel(id: string): void {
  const models = loadCustomModels().filter((m) => m.id !== id);
  try {
    localStorage.setItem(CUSTOM_MODELS_KEY, JSON.stringify(models));
  } catch {
    // ignore
  }
}

// --- Default Model ---

const DEFAULT_MODEL_KEY = "browserai-default-model";

export function loadDefaultModelId(): string | null {
  try {
    return localStorage.getItem(DEFAULT_MODEL_KEY);
  } catch {
    return null;
  }
}

export function saveDefaultModelId(id: string): void {
  try {
    localStorage.setItem(DEFAULT_MODEL_KEY, id);
  } catch {
    // ignore
  }
}

export function clearDefaultModelId(): void {
  try {
    localStorage.removeItem(DEFAULT_MODEL_KEY);
  } catch {
    // ignore
  }
}
