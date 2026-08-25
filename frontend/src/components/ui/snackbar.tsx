"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Check, X, AlertCircle } from "lucide-react";

type SnackbarType = "success" | "error" | "info";

interface SnackbarContextType {
  show: (message: string, type?: SnackbarType, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

// Global reference for static (non-hook) imports of snackbar
let globalShow: (message: string, type?: SnackbarType, duration?: number) => void = () => {};

export const showSnackbar = (message: string, type: SnackbarType = "success", duration?: number) => {
  globalShow(message, type, duration);
};

export const snackbar = {
  success: (message: string, duration?: number) => showSnackbar(message, "success", duration),
  error: (message: string, duration?: number) => showSnackbar(message, "error", duration),
  info: (message: string, duration?: number) => showSnackbar(message, "info", duration),
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<SnackbarType>("success");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const show = useCallback(
    (msg: string, t: SnackbarType = "success", duration: number = 4000) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setMessage(msg);
      setType(t);
      setIsOpen(true);

      const id = setTimeout(() => {
        setIsOpen(false);
      }, duration);
      setTimeoutId(id);
    },
    [timeoutId]
  );

  // Link static caller to React lifecycle
  React.useEffect(() => {
    globalShow = (msg, t, dur) => show(msg, t, dur);
  }, [show]);

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}

      {/* Premium Dark Toast / Snackbar Element */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-slide-up">
          <div className="flex items-center gap-4 bg-[#111c2a] text-white px-5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.45)] border border-slate-800/80 min-w-[300px] max-w-[450px]">
            {/* Left Circular Badge */}
            <div className="flex-shrink-0">
              {type === "success" ? (
                <div className="w-7 h-7 rounded-full bg-[#10b981] flex items-center justify-center text-white">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : type === "error" ? (
                <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white">
                  <AlertCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Message Text */}
            <p className="text-sm font-semibold tracking-wide text-slate-100 flex-1 leading-snug">
              {message}
            </p>

            {/* Close Button */}
            <button
              onClick={close}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800/50 cursor-pointer"
              title="Close"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}
    </SnackbarContext.Provider>
  );
};
