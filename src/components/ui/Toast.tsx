import { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms, 0 = no auto-close
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration === 0) return;
    const duration = toast.duration ?? 3000;
    const timer = setTimeout(() => onClose(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const styles = {
    success: { bg: "#14532d", border: "#16a34a", text: "#86efac", icon: CheckCircle2 },
    error:   { bg: "#450a0a", border: "#dc2626", text: "#fca5a5", icon: AlertCircle },
    info:    { bg: "#1e1b4b", border: "#6366f1", text: "#a5b4fc", icon: Info },
  }[toast.type];

  const Icon = styles.icon;

  return (
    <div
      className="flex items-center gap-3 rounded-lg px-4 py-3"
      style={{
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        animation: "toast-in 0.25s ease-out",
      }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: styles.text }} />
      <span className="text-sm font-medium" style={{ color: styles.text }}>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-auto p-1 rounded transition-colors cursor-pointer"
        style={{ color: styles.text, opacity: 0.7 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
