import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "warning" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const iconMap: Record<ToastType, string> = {
    success: "check_circle",
    warning: "warning",
    error: "error",
    info: "info",
  };

  const colorMap: Record<ToastType, string> = {
    success: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200",
    warning:
      "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
    error: "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200",
    info: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200",
  };

  const iconColorMap: Record<ToastType, string> = {
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    info: "text-blue-500",
  };

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="alert"
            className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 ${
              colorMap[item.type]
            } ${item.exiting ? "translate-x-4 scale-95 opacity-0" : "translate-x-0 scale-100 opacity-100"}`}
          >
            <span className={`material-symbols-outlined text-xl ${iconColorMap[item.type]}`}>
              {iconMap[item.type]}
            </span>
            <p className="flex-1 text-sm font-medium">{item.message}</p>
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 rounded p-0.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-sm opacity-50">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
