/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface ModalConfig {
  content: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
}

interface ModalContextType {
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const openModal = useCallback((config: ModalConfig) => {
    setModalConfig(config);
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig(null);
  }, []);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const activeSize = modalConfig?.size || "md";

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <AnimatePresence>
        {modalConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={modalConfig.closeOnOverlayClick !== false ? closeModal : undefined}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`relative z-10 w-full ${sizeClasses[activeSize]} bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]`}
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800 shrink-0">
                <h3 className="text-lg font-semibold text-white">
                  {modalConfig.title || "Modal Window"}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto pt-4 text-zinc-300">
                {modalConfig.content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
