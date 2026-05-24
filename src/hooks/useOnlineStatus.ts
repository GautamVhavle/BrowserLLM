/**
 * Tracks browser online/offline state.
 * `wasOffline` stays true once the user goes offline so the "back online"
 * banner can be shown when connectivity is restored.
 */
import { useState, useEffect } from "react";

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
