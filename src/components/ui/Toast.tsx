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

  const bgColor = {
    success: "bg-green-500/10 border-green-500/20",
    error: "bg-red-500/10 border-red-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
  }[toast.type];

  const textColor = {
    success: "text-green-400",
    error: "text-red-400",
    info: "text-blue-400",
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${bgColor}`}
      style={{ animation: "toast-in 0.25s ease-out" }}
    >
      <Icon className={`w-4 h-4 ${textColor} shrink-0`} />
      <span className={`text-sm ${textColor}`}>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className={`ml-auto p-1 rounded hover:bg-white/[0.08] transition-colors cursor-pointer ${textColor} opacity-70 hover:opacity-100`}
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
