import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback, useRef } from "react";
import { useChatManager } from "../hooks/useChatManager";
import { useSEO } from "../hooks/useSEO";
import { ChatLayout } from "../components/chat";

export default function ChatPage() {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();
  const manager = useChatManager();
  const createRef = useRef(manager.createChat);
  const chatsRef = useRef(manager.chats);
  const activeRef = useRef(manager.activeChatId);
  const switchRef = useRef(manager.switchChat);
  const bareHandled = useRef(false);
  const replacedUnknown = useRef<string | null>(null);

  useEffect(() => {
    createRef.current = manager.createChat;
    chatsRef.current = manager.chats;
    activeRef.current = manager.activeChatId;
    switchRef.current = manager.switchChat;
  }, [manager]);

  useSEO({
    title: "AI Chat",
    description: "Chat with AI models running entirely in your browser. Private, offline, and free.",
    path: "/chat",
    noindex: true,
  });

  // /chat with no id resumes the latest thread. A new thread is created only
  // when the user has none, and only once per visit (Strict Mode re-runs effects).
  useEffect(() => {
    if (threadId) {
      bareHandled.current = false;
      return;
    }
    const chats = chatsRef.current;
    const active = activeRef.current;
    const existing =
      active && chats.some((c) => c.id === active) ? active : chats[0]?.id;
    if (existing) {
      navigate(`/chat/${existing}`, { replace: true });
      return;
    }
    if (bareHandled.current) return;
    bareHandled.current = true;
    navigate(`/chat/${createRef.current()}`, { replace: true });
  }, [threadId, navigate]);

  useEffect(() => {
    if (!threadId || threadId === activeRef.current) return;
    if (chatsRef.current.some((c) => c.id === threadId)) {
      switchRef.current(threadId);
      return;
    }
    if (replacedUnknown.current === threadId) return;
    replacedUnknown.current = threadId;
    navigate(`/chat/${createRef.current()}`, { replace: true });
  }, [threadId, navigate]);

  const handleNewChat = useCallback(() => {
    const id = manager.createChat();
    navigate(`/chat/${id}`);
  }, [manager, navigate]);

  const handleSwitchChat = useCallback((id: string) => {
    manager.switchChat(id);
    navigate(`/chat/${id}`);
  }, [manager, navigate]);

  const handleDeleteChat = useCallback((id: string) => {
    const wasActive = manager.activeChatId === id;
    const next = manager.deleteChat(id);
    if (!wasActive) return;
    navigate(next ? `/chat/${next}` : "/chat");
  }, [manager, navigate]);

  if (!threadId) return null;

  return (
    <ChatLayout
      chats={manager.chats}
      activeChatId={manager.activeChatId}
      activeChat={manager.activeChat}
      onNewChat={handleNewChat}
      onSwitchChat={handleSwitchChat}
      onDeleteChat={handleDeleteChat}
      onClearChat={manager.clearActiveChat}
      onSendMessage={manager.sendMessage}
      onEditLastUser={manager.editLastUserMessage}
      onRegenerate={manager.regenerate}
      selectedModelId={manager.selectedModelId}
      loadedModelId={manager.loadedModelId}
      onSelectModel={manager.setSelectedModelId}
      isModelLoaded={manager.isModelLoaded}
      isLoadingModel={manager.isLoadingModel}
      isGenerating={manager.isGenerating}
      loadingProgress={manager.loadingProgress}
      error={manager.error}
      onLoadModel={manager.loadModel}
      onCancelDownload={manager.cancelDownload}
      onStopGeneration={manager.stopGeneration}
      storageError={manager.storageError}
      onBack={() => navigate("/")}
      backgroundDownloads={manager.backgroundDownloads}
      onDismissBackgroundDownload={manager.dismissBackgroundDownload}
    />
  );
}
