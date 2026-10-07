"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CheckCircleIcon, InfoCircleIcon, XCircleIcon } from "@/components/icons";

export type ToastKind = "success" | "error" | "info";

interface ToastEntry {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextToastId = 1;
const TOAST_DURATION_MS = 2600;

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const KIND_STYLES: Record<ToastKind, string> = {
  success: "border-emerald-500/40 text-foreground",
  error: "border-red-500/50 text-foreground",
  info: "border-border text-foreground",
};

const KIND_ICONS: Record<ToastKind, ReactNode> = {
  success: <CheckCircleIcon className="size-4 text-emerald-500" aria-hidden />,
  error: <XCircleIcon className="size-4 text-red-500" aria-hidden />,
  info: <InfoCircleIcon className="size-4 text-indigo-400" aria-hidden />,
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef<Set<number>>(new Set());

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextToastId++;
    setToasts((prev) => [...prev.slice(-4), { id, message, kind }]);
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
    timers.current.add(timer);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) window.clearTimeout(timer);
      pending.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={cn(
              "animate-toast pointer-events-auto flex items-center gap-2 rounded-full border bg-surface px-4 py-2 text-sm shadow-lg",
              KIND_STYLES[t.kind],
            )}
          >
            {KIND_ICONS[t.kind]}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
