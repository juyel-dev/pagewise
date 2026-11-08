"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { id: string; label: ReactNode; panel: ReactNode };

type Props = {
  tabs: TabItem[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  className?: string;
  /** Stretch tabs across the full width (phone Read | Practise). */
  fill?: boolean;
};

/** Underline tabs. Inactive panels stay mounted but hidden so their state (scroll, selection) is kept. */
export function Tabs({ tabs, label, value, defaultValue, onValueChange, className, fill }: Props) {
  const uid = useId();
  const [inner, setInner] = useState(defaultValue ?? tabs[0]?.id);
  const current = value ?? inner;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function select(id: string) {
    if (value === undefined) setInner(id);
    onValueChange?.(id);
  }
  function onKeyDown(e: KeyboardEvent, index: number) {
    let target = -1;
    if (e.key === "ArrowRight") target = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") target = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = tabs.length - 1;
    if (target < 0) return;
    e.preventDefault();
    refs.current[target]?.focus();
    select(tabs[target].id);
  }

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex border-b border-line">
        {tabs.map((t, i) => {
          const selected = t.id === current;
          return (
            <button
              key={t.id}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="tab"
              id={`${uid}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "-mb-px h-11 border-b-2 px-4 text-label transition-colors",
                fill && "flex-1",
                selected ? "border-brand text-brand-text" : "border-transparent text-ink-2 hover:text-ink",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`${uid}-panel-${t.id}`} aria-labelledby={`${uid}-tab-${t.id}`} hidden={t.id !== current}>
          {t.panel}
        </div>
      ))}
    </div>
  );
}
