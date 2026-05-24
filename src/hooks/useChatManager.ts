/**
 * Central chat state manager.
 *
 * Wraps `useWebLLM` and adds:
 * - Multi-chat CRUD (create, switch, delete, rename, clear)
 * - localStorage persistence via `storage.ts`
 * - Auto-titling from the first user message
 * - Streaming token updates into the active chat
 * - Proxied access to engine state (loading, generating, stats, downloads)
 *
 * This hook is instantiated once per `ChatPage` and its return value is
 * threaded down through `ChatLayout` props.
 */
import { useState, useCallback, useEffect } from "react";
import type { ChatSession, Message } from "../types";
import { DEFAULT_MODEL_ID } from "../lib/models";
import {
  loadAllChats,
  saveChat,
  deleteChat as removeChat,
  generateChatId,
  generateTitle,
  loadActiveChatId,
  saveActiveChatId,
  loadDefaultModelId,
} from "../lib/storage";
import { useWebLLM } from "./useWebLLM";

export function useChatManager() {
  const [chats, setChats] = useState<ChatSession[]>(() => loadAllChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(
    () => loadActiveChatId()
  );
  const [selectedModelId, setSelectedModelId] = useState(() => {
    const stored = localStorage.getItem("browserai-selected-model");
    if (stored) {
      localStorage.removeItem("browserai-selected-model");
      return stored;
    }
    return loadDefaultModelId() ?? DEFAULT_MODEL_ID;
  });

  const engine = useWebLLM();

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  // Sync active chat ID to localStorage
  useEffect(() => {
    saveActiveChatId(activeChatId);
  }, [activeChatId]);

  // When switching to a chat, sync the model selection
  useEffect(() => {
    if (activeChat) {
      setSelectedModelId(activeChat.modelId);
    }
  }, [activeChat?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateChat = useCallback(
    (id: string, updater: (chat: ChatSession) => ChatSession) => {
      setChats((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? updater(c) : c
        );
        const chat = updated.find((c) => c.id === id);
        if (chat) saveChat(chat);
        return updated;
      });
    },
    []
  );

  const createChat = useCallback(
    (modelId?: string): string => {
      const id = generateChatId();
      const session: ChatSession = {
        id,
        title: "New Chat",
        modelId: modelId ?? selectedModelId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setChats((prev) => [session, ...prev]);
      saveChat(session);
      setActiveChatId(id);
      setSelectedModelId(session.modelId);
      return id;
    },
    [selectedModelId]
  );

  const switchChat = useCallback((id: string) => {
    setActiveChatId(id);
  }, []);

  const deleteChatById = useCallback(
    (id: string) => {
      removeChat(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) {
        setChats((prev) => {
          const remaining = prev;
          setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
          return remaining;
        });
      }
    },
    [activeChatId]
  );

  const renameChat = useCallback(
    (id: string, title: string) => {
      updateChat(id, (c) => ({ ...c, title, updatedAt: Date.now() }));
    },
    [updateChat]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeChatId || engine.isGenerating) return;

      const userMsg: Message = { role: "user", content };

      // Update chat with user message
      updateChat(activeChatId, (c) => {
        const updated = {
          ...c,
          messages: [...c.messages, userMsg],
          updatedAt: Date.now(),
        };
        if (c.title === "New Chat") {
          updated.title = generateTitle(content);
        }
        return updated;
      });

      // Add placeholder assistant message
      const assistantMsg: Message = { role: "assistant", content: "" };
      updateChat(activeChatId, (c) => ({
        ...c,
        messages: [...c.messages, assistantMsg],
        updatedAt: Date.now(),
      }));

      // Build full history for the model
      const currentChat = chats.find((c) => c.id === activeChatId);
      const history: Message[] = [
        ...(currentChat?.messages ?? []),
        userMsg,
      ];

      try {
        const finalText = await engine.generate(history, (fullText) => {
          updateChat(activeChatId, (c) => {
            const msgs = [...c.messages];
            msgs[msgs.length - 1] = { role: "assistant", content: fullText };
            return { ...c, messages: msgs, updatedAt: Date.now() };
          });
        });

        updateChat(activeChatId, (c) => {
          const msgs = [...c.messages];
          msgs[msgs.length - 1] = { role: "assistant", content: finalText };
          return { ...c, messages: msgs, updatedAt: Date.now() };
        });
      } catch (err) {
        updateChat(activeChatId, (c) => {
          const msgs = [...c.messages];
          msgs[msgs.length - 1] = {
            role: "assistant",
            content: `Error: ${err instanceof Error ? err.message : String(err)}`,
          };
          return { ...c, messages: msgs, updatedAt: Date.now() };
        });
      }
    },
    [activeChatId, chats, engine, updateChat]
  );

  const clearActiveChat = useCallback(() => {
    if (!activeChatId) return;
    updateChat(activeChatId, (c) => ({
      ...c,
      messages: [],
      title: "New Chat",
      updatedAt: Date.now(),
    }));
  }, [activeChatId, updateChat]);

  return {
    // Chat management
    chats,
    activeChatId,
    activeChat,
    createChat,
    switchChat,
    deleteChat: deleteChatById,
    renameChat,
    clearActiveChat,

    // Model
    selectedModelId,
    setSelectedModelId,

    // Messages
    sendMessage,

    // Engine (proxied)
    isModelLoaded: engine.isModelLoaded,
    isLoadingModel: engine.isLoadingModel,
    isGenerating: engine.isGenerating,
    loadingProgress: engine.loadingProgress,
    loadedModelId: engine.loadedModelId,
    error: engine.error,
    loadModel: engine.loadModel,
    cancelDownload: engine.cancelDownload,
    stopGeneration: engine.stopGeneration,
    lastStats: engine.lastStats,
    backgroundDownloads: engine.backgroundDownloads,
    startBackgroundDownload: engine.startBackgroundDownload,
    cancelBackgroundDownload: engine.cancelBackgroundDownload,
    dismissBackgroundDownload: engine.dismissBackgroundDownload,
  };
}
