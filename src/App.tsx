/**
 * Root application component.
 *
 * Defines three routes:
 *   /             , Marketing landing page
 *   /models       , Full model catalog with hardware detection
 *   /chat/:threadId, Chat interface (each conversation gets a unique URL)
 *
 * ChatPage is lazy-loaded so the heavy @mlc-ai/web-llm library (6+ MB WASM)
 * is only fetched when the user navigates to /chat. This keeps the landing
 * page fast and prevents mobile OOM crashes.
 */
import { Routes, Route, useNavigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { WifiOff, Loader2 } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { StarField } from "./components/ui";
import { Landing } from "./components/landing";
import { ModelsPage } from "./pages/ModelsPage";
import { SelectModelPage } from "./pages/SelectModelPage";

const ChatPage = lazy(() => import("./pages/ChatPage"));

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

function ChatFallback() {
  return (
    <div className="min-h-screen bg-[#06060a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        <p className="text-sm text-gray-500">Loading chat...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Analytics />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/select-model" element={<SelectModelPage />} />
        <Route path="/chat" element={<Suspense fallback={<ChatFallback />}><ChatPage /></Suspense>} />
        <Route path="/chat/:threadId" element={<Suspense fallback={<ChatFallback />}><ChatPage /></Suspense>} />
      </Routes>
    </>
  );
}

export default App;
