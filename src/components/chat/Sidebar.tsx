/**
 * Sidebar listing all chat threads, sorted by most recent.
 * Each item shows the chat title, model name, and relative time.
 * Supports new chat creation, switching, and deletion.
 */
import { Plus, MessageSquare, Trash2, PanelLeftClose } from "lucide-react";
import type { ChatSession } from "../../types";

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSwitchChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClose: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  onClose,
}: SidebarProps) {
  const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col h-full bg-[#08080f] border-r border-white/[0.06]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          New chat
        </button>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-300 transition-colors p-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {sorted.length === 0 ? (
          <div className="text-gray-600 text-xs text-center py-8 px-4">
            No conversations yet
          </div>
        ) : (
          sorted.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                onClick={() => onSwitchChat(chat.id)}
                className={`group flex items-center gap-2.5 mx-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-white/[0.07] text-white"
                    : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-40" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] truncate">{chat.title}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    {timeAgo(chat.updatedAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1 rounded cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
