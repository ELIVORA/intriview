/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface IToast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<IToast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, title, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        id="toast-container"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              className="pointer-events-auto w-full bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 text-zinc-100 p-4 rounded-xl shadow-xl flex gap-3 items-start"
            >
              <div className="shrink-0 mt-0.5">
                {item.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {item.type === "error" && <XCircle className="w-5 h-5 text-red-400" />}
                {item.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {item.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                {item.title && <h4 className="text-sm font-semibold text-white mb-0.5">{item.title}</h4>}
                <p className="text-xs text-zinc-400 leading-relaxed break-words">{item.message}</p>
              </div>
              <button
                onClick={() => dismiss(item.id)}
                className="shrink-0 p-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
