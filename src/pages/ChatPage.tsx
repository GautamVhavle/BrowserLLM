import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { useChatManager } from "../hooks/useChatManager";
import { useSEO } from "../hooks/useSEO";
import { ChatLayout } from "../components/chat";

export default function ChatPage() {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();
  const manager = useChatManager();

  useSEO({
    title: "AI Chat",
    description: "Chat with AI models running entirely in your browser. Private, offline, and free.",
    path: "/chat",
    noindex: true,
  });

  // If no threadId in URL, create a new chat and redirect
  useEffect(() => {
    if (!threadId) {
      const id = manager.createChat();
      navigate(`/chat/${id}`, { replace: true });
    }
  }, [threadId]); // eslint-disable-line react-hooks/exhaustive-deps

  // If threadId in URL but not the active chat, switch to it
  useEffect(() => {
    if (threadId && threadId !== manager.activeChatId) {
      const chatExists = manager.chats.some((c) => c.id === threadId);
      if (chatExists) {
        manager.switchChat(threadId);
      } else {
        // Chat doesn't exist, create new and redirect
        const id = manager.createChat();
        navigate(`/chat/${id}`, { replace: true });
      }
    }
  }, [threadId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewChat = useCallback(() => {
    const id = manager.createChat();
    navigate(`/chat/${id}`);
  }, [manager, navigate]);

  const handleSwitchChat = useCallback((id: string) => {
    manager.switchChat(id);
    navigate(`/chat/${id}`);
  }, [manager, navigate]);

  const handleDeleteChat = useCallback((id: string) => {
    manager.deleteChat(id);
    const remaining = manager.chats.filter((c) => c.id !== id);
    if (remaining.length > 0) {
      navigate(`/chat/${remaining[0].id}`);
    } else {
      navigate("/chat");
    }
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
      onBack={() => navigate("/")}
      backgroundDownloads={manager.backgroundDownloads}
      onDismissBackgroundDownload={manager.dismissBackgroundDownload}
    />
  );
}
