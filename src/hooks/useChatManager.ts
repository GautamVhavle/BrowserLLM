/**
 * Central chat state manager.
 *
 * Memory is the source of truth after the initial load. Streaming updates
 * are debounced to localStorage; structural edits flush immediately.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatSession, ConversationMemory, Message } from "../types";
import { DEFAULT_MODEL_ID, getModelById } from "../lib/models";
import {
  loadAllChats,
  saveAllChats,
  generateChatId,
  generateTitle,
  loadActiveChatId,
  saveActiveChatId,
  loadDefaultModelId,
  readLocal,
  removeLocal,
} from "../lib/storage";
import { useWebLLM } from "./useWebLLM";

const STORAGE_FULL =
  "This browser couldn't save the conversation. Free some space, then send another message.";

export function useChatManager() {
  const pickedOnEntry = useRef<string | null>(null);
  const [chats, setChats] = useState<ChatSession[]>(() => loadAllChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(
    () => loadActiveChatId()
  );
  const [storageError, setStorageError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelIdState] = useState(() => {
    const stored = readLocal("browserai-selected-model");
    if (stored) pickedOnEntry.current = stored;
    return stored ?? loadDefaultModelId() ?? DEFAULT_MODEL_ID;
  });

  const engine = useWebLLM();
  const chatsRef = useRef(chats);
  chatsRef.current = chats;
  const selectedRef = useRef(selectedModelId);
  selectedRef.current = selectedModelId;
  const loadedRef = useRef(engine.isModelLoaded);
  loadedRef.current = engine.isModelLoaded;
  const loadedIdRef = useRef(engine.loadedModelId);
  loadedIdRef.current = engine.loadedModelId;
  const generate = engine.generate;
  const sendingRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const persist = useCallback((next: ChatSession[]) => {
    setStorageError(saveAllChats(next) ? null : STORAGE_FULL);
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      persist(chatsRef.current);
    }, 500);
  }, [persist]);

  const commit = useCallback(
    (next: ChatSession[], mode: "now" | "soon") => {
      chatsRef.current = next;
      setChats(next);
      if (mode === "now") {
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
        persist(next);
      } else {
        scheduleSave();
      }
    },
    [persist, scheduleSave],
  );

  useEffect(() => {
    const flush = () => {
      if (!saveTimer.current) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      persist(chatsRef.current);
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [persist]);

  useEffect(() => {
    saveActiveChatId(activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    if (pickedOnEntry.current) removeLocal("browserai-selected-model");
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    const chat = chatsRef.current.find((c) => c.id === activeChatId);
    if (!chat) return;
    const pick = pickedOnEntry.current;
    if (pick) {
      pickedOnEntry.current = null;
      selectedRef.current = pick;
      setSelectedModelIdState(pick);
      if (chat.modelId !== pick) {
        commit(
          chatsRef.current.map((c) =>
            c.id === activeChatId ? { ...c, modelId: pick, updatedAt: Date.now() } : c,
          ),
          "now",
        );
      }
      return;
    }
    selectedRef.current = chat.modelId;
    setSelectedModelIdState(chat.modelId);
  }, [activeChatId, commit]);

  useEffect(() => {
    const loaded = engine.loadedModelId;
    if (!loaded || !activeChatId) return;
    const chat = chatsRef.current.find((c) => c.id === activeChatId);
    if (!chat || chat.modelId === loaded) return;
    selectedRef.current = loaded;
    setSelectedModelIdState(loaded);
    commit(
      chatsRef.current.map((c) =>
        c.id === activeChatId ? { ...c, modelId: loaded, updatedAt: Date.now() } : c,
      ),
      "now",
    );
  }, [engine.loadedModelId, activeChatId, commit]);

  const updateChat = useCallback(
    (id: string, updater: (chat: ChatSession) => ChatSession, mode: "now" | "soon" = "soon") => {
      commit(
        chatsRef.current.map((c) => (c.id === id ? updater(c) : c)),
        mode,
      );
    },
    [commit],
  );

  const createChat = useCallback(
    (modelId?: string): string => {
      const id = generateChatId();
      const session: ChatSession = {
        id,
        title: "New Chat",
        modelId: modelId ?? selectedRef.current,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      commit([session, ...chatsRef.current], "now");
      setActiveChatId(id);
      selectedRef.current = session.modelId;
      setSelectedModelIdState(session.modelId);
      return id;
    },
    [commit],
  );

  const switchChat = useCallback((id: string) => {
    setActiveChatId(id);
  }, []);

  const deleteChat = useCallback(
    (id: string): string | null => {
      const remaining = chatsRef.current.filter((c) => c.id !== id);
      const next =
        [...remaining].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null;
      commit(remaining, "now");
      setActiveChatId((current) => (current === id ? next : current));
      return next;
    },
    [commit],
  );

  const renameChat = useCallback(
    (id: string, title: string) => {
      updateChat(id, (c) => ({ ...c, title, updatedAt: Date.now() }), "now");
    },
    [updateChat],
  );

  const setSelectedModelId = useCallback(
    (id: string) => {
      selectedRef.current = id;
      setSelectedModelIdState(id);
      if (!activeChatId) return;
      updateChat(
        activeChatId,
        (c) => ({ ...c, modelId: id, updatedAt: Date.now() }),
        "now",
      );
    },
    [activeChatId, updateChat],
  );

  const storedMemory = (memory: ConversationMemory | null): ConversationMemory | undefined =>
    memory ?? undefined;

  const runReply = useCallback(
    async (chatId: string, history: Message[]) => {
      if (sendingRef.current || !loadedRef.current) return;
      sendingRef.current = true;
      const priorMemory = chatsRef.current.find((c) => c.id === chatId)?.memory ?? null;

      updateChat(chatId, (c) => ({
        ...c,
        messages: [...history, { role: "assistant", content: "" }],
        updatedAt: Date.now(),
      }));

      try {
        const { text: finalText, stats: finalStats, memory } = await generate(
          history,
          (fullText) => {
            updateChat(chatId, (c) => {
              const msgs = [...c.messages];
              const last = msgs[msgs.length - 1];
              if (!last || last.role !== "assistant") return c;
              msgs[msgs.length - 1] = { role: "assistant", content: fullText };
              return { ...c, messages: msgs, updatedAt: Date.now() };
            });
          },
          priorMemory,
        );

        if (!finalText) {
          updateChat(
            chatId,
            (c) => ({
              ...c,
              memory: storedMemory(memory),
              messages: c.messages.filter((m, i) => {
                const isEmptyTail = i === c.messages.length - 1 && m.role === "assistant" && !m.content;
                return !isEmptyTail;
              }),
              updatedAt: Date.now(),
            }),
            "now",
          );
          return;
        }

        const modelId = loadedIdRef.current ?? selectedRef.current;
        const modelName = getModelById(modelId)?.name ?? modelId;
        updateChat(
          chatId,
          (c) => {
            const msgs = [...c.messages];
            msgs[msgs.length - 1] = {
              role: "assistant",
              content: finalText,
              modelName,
              ...(finalStats ? { stats: finalStats } : {}),
            };
            return { ...c, messages: msgs, memory: storedMemory(memory), modelId, updatedAt: Date.now() };
          },
          "now",
        );
      } catch (err) {
        updateChat(
          chatId,
          (c) => {
            const msgs = [...c.messages];
            msgs[msgs.length - 1] = {
              role: "assistant",
              content: `Error: ${err instanceof Error ? err.message : String(err)}`,
              error: true,
            };
            return { ...c, messages: msgs, updatedAt: Date.now() };
          },
          "now",
        );
      } finally {
        sendingRef.current = false;
      }
    },
    [generate, updateChat],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeChatId || sendingRef.current || !loadedRef.current) return;
      const userMsg: Message = { role: "user", content };
      const base = chatsRef.current.find((c) => c.id === activeChatId);
      updateChat(activeChatId, (c) => ({
        ...c,
        messages: [...c.messages, userMsg],
        title: c.title === "New Chat" ? generateTitle(content) : c.title,
        updatedAt: Date.now(),
      }));
      await runReply(activeChatId, [...(base?.messages ?? []), userMsg]);
    },
    [activeChatId, runReply, updateChat],
  );

  const editLastUserMessage = useCallback(
    async (content: string) => {
      if (!activeChatId || sendingRef.current || !loadedRef.current) return;
      const trimmed = content.trim();
      if (!trimmed) return;
      const chat = chatsRef.current.find((c) => c.id === activeChatId);
      if (!chat) return;
      let cut = -1;
      for (let i = chat.messages.length - 1; i >= 0; i--) {
        if (chat.messages[i].role === "user") {
          cut = i;
          break;
        }
      }
      if (cut < 0) return;
      const memory = chat.memory && chat.memory.coveredCount > cut
        ? { ...chat.memory, coveredCount: cut }
        : chat.memory;
      updateChat(activeChatId, (c) => ({ ...c, memory, updatedAt: Date.now() }), "now");
      await runReply(activeChatId, [
        ...chat.messages.slice(0, cut),
        { role: "user", content: trimmed },
      ]);
    },
    [activeChatId, runReply, updateChat],
  );

  const regenerate = useCallback(
    async () => {
      if (!activeChatId || sendingRef.current || !loadedRef.current) return;
      const chat = chatsRef.current.find((c) => c.id === activeChatId);
      if (!chat) return;
      const history = chat.messages[chat.messages.length - 1]?.role === "assistant"
        ? chat.messages.slice(0, -1)
        : chat.messages;
      if (!history.some((message) => message.role === "user")) return;
      await runReply(activeChatId, history);
    },
    [activeChatId, runReply],
  );

  const clearActiveChat = useCallback(() => {
    if (!activeChatId) return;
    updateChat(
      activeChatId,
      (c) => ({
        ...c,
        messages: [],
        title: "New Chat",
        memory: undefined,
        updatedAt: Date.now(),
      }),
      "now",
    );
  }, [activeChatId, updateChat]);

  return {
    chats,
    activeChatId,
    activeChat,
    createChat,
    switchChat,
    deleteChat,
    renameChat,
    clearActiveChat,
    selectedModelId,
    setSelectedModelId,
    sendMessage,
    editLastUserMessage,
    regenerate,
    storageError,
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
