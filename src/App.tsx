/**
 * Root application component.
 *
 * Defines three routes:
 *   /             , Marketing landing page
 *   /models       , Full model catalog with hardware detection
 *   /chat/:threadId, Chat interface (each conversation gets a unique URL)
 */
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { WifiOff } from "lucide-react";
import { useChatManager } from "./hooks/useChatManager";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { StarField } from "./components/ui";
import { ChatLayout } from "./components/chat";
import { Landing } from "./components/landing";
import { ModelsPage } from "./pages/ModelsPage";

function LandingPage() {
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();

  return (
    <div className="min-h-screen bg-[#06060a]">
      <StarField />
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500/10 backdrop-blur-md border-b border-orange-500/20 px-4 py-2.5 text-center text-sm text-orange-400 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>You're offline. BrowserAI works without internet</span>
        </div>
      )}
      <Landing onStart={() => navigate("/models")} />
    </div>
  );
}

function ChatPage() {
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();
  const manager = useChatManager();

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
    <>
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
        lastStats={manager.lastStats}
        backgroundDownloads={manager.backgroundDownloads}
        onDismissBackgroundDownload={manager.dismissBackgroundDownload}
      />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/models" element={<ModelsPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chat/:threadId" element={<ChatPage />} />
    </Routes>
  );
}

export default App;
