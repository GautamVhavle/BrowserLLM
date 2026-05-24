/**
 * Header badge showing connectivity state.
 *
 * - Offline: persistent orange "Offline" badge.
 * - Just reconnected: green "Back online" badge (auto-dismisses after 5s).
 * - Stable online: hidden (returns null).
 */
import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export function OnlineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && showReconnected) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full animate-pulse">
        <Wifi className="w-3 h-3" />
        <span className="hidden sm:inline">Back online</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
        <WifiOff className="w-3 h-3" />
        <span>Offline</span>
      </div>
    );
  }

  // Online (stable), show nothing or subtle indicator
  return null;
}
