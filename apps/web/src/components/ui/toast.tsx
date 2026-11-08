"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./icon-button";

type Tone = "neutral" | "success" | "error";
export type ToastInput = { title: string; description?: string; tone?: Tone; action?: { label: string; onClick: () => void }; durationMs?: number };
type ToastItem = ToastInput & { id: number };
type Ctx = { toast: (t: ToastInput) => number; dismiss: (id: number) => void };

const ToastContext = createContext<Ctx | null>(null);
const MAX_VISIBLE = 3;

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/** Mount once near the root. Toasts: 4 s (errors 8 s, with an action: until dismissed); pause on hover and focus; at most 3 at a time. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(1);
  const dismiss = useCallback((id: number) => setItems((cur) => cur.filter((t) => t.id !== id)), []);
  const toast = useCallback((t: ToastInput) => {
    const id = next.current++;
    setItems((cur) => [...cur, { ...t, id }].slice(-MAX_VISIBLE));
    return id;
  }, []);
  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="region" aria-label="Notifications" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-4">
        {items.map((t) => <ToastCard key={t.id} item={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

const icons = { neutral: Info, success: CheckCircle2, error: XCircle } as const;
const iconTone = { neutral: "text-ink-2", success: "text-good", error: "text-bad" } as const;

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const tone = item.tone ?? "neutral";
  const [paused, setPaused] = useState(false);
  const duration = item.durationMs ?? (item.action ? 0 : tone === "error" ? 8000 : 4000);
  useEffect(() => {
    if (paused || duration <= 0) return;
    const timer = setTimeout(() => onDismiss(item.id), duration);
    return () => clearTimeout(timer);
  }, [paused, duration, item.id, onDismiss]);
  const Icon = icons[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn("pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-line bg-surface p-3 shadow-window", tone === "error" && "border-bad")}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconTone[tone])} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-label text-ink">{item.title}</p>
        {item.description ? <p className="text-small text-ink-2">{item.description}</p> : null}
      </div>
      {item.action ? (
        <button type="button" className="rounded px-2 text-label text-brand-text hover:underline pointer-coarse:min-h-11" onClick={() => { item.action?.onClick(); onDismiss(item.id); }}>{item.action.label}</button>
      ) : null}
      <IconButton label="Dismiss" size="sm" onClick={() => onDismiss(item.id)}><X className="size-4" aria-hidden="true" /></IconButton>
    </div>
  );
}
