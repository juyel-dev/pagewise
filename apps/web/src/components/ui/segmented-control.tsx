"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SegmentOption<T extends string> = { value: T; label: ReactNode; disabled?: boolean };

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group. */
  label: string;
  size?: "sm" | "md";
  className?: string;
};

/** Two to four mutually exclusive options in a pill track. Radio-group semantics; arrow keys move and select. */
export function SegmentedControl<T extends string>({ options, value, onChange, label, size = "md", className }: Props<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function move(from: number, step: 1 | -1 | "first" | "last") {
    const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    if (enabled.length === 0) return;
    let target: number;
    if (step === "first") target = enabled[0];
    else if (step === "last") target = enabled[enabled.length - 1];
    else {
      const pos = enabled.indexOf(from);
      target = enabled[(pos + step + enabled.length) % enabled.length];
    }
    refs.current[target]?.focus();
    onChange(options[target].value);
  }

  function onKeyDown(e: KeyboardEvent, index: number) {
    const map: Record<string, 1 | -1 | "first" | "last"> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: "first", End: "last" };
    const step = map[e.key];
    if (step === undefined) return;
    e.preventDefault();
    move(index, step);
  }

  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex rounded-full bg-surface-2 p-1", className)}>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={o.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "rounded-full text-label transition-colors disabled:opacity-50 pointer-coarse:min-h-11",
              size === "sm" ? "h-7 px-3" : "h-8 px-4",
              selected ? "bg-surface text-ink shadow-card" : "text-ink-2 hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
