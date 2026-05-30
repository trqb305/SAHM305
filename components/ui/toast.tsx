"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Check } from "lucide-react";

interface ToastContextValue {
  show: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <ToastContext.Provider value={{ show: setMsg }}>
      {children}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] transition-transform duration-300 ${
          msg ? "translate-y-0" : "translate-y-32"
        }`}
        style={{ pointerEvents: msg ? "auto" : "none" }}
      >
        {msg && (
          <div className="flex items-center gap-2.5 bg-bg-elevated border rounded-xl px-5 py-3 text-sm shadow-xl"
               style={{ borderColor: "rgb(var(--gold))" }}>
            <Check size={16} className="text-gold-bright" strokeWidth={1.5} />
            <span>{msg}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
