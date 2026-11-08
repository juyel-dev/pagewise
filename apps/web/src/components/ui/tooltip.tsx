"use client";

import { cloneElement, useEffect, useId, useState, type ReactElement } from "react";

type ChildProps = { "aria-describedby"?: string; onMouseEnter?: (e: React.MouseEvent) => void; onMouseLeave?: (e: React.MouseEvent) => void; onFocus?: (e: React.FocusEvent) => void; onBlur?: (e: React.FocusEvent) => void; onKeyDown?: (e: React.KeyboardEvent) => void };

/** Short text hint on hover or keyboard focus (after 400 ms). Never put essential information here. */
export function Tooltip({ label, children, delay = 400 }: { label: string; children: ReactElement<ChildProps>; delay?: number }) {
  const id = useId();
  // closed -> pending (waiting for the delay) -> open. State, not refs, so it is safe during render.
  const [phase, setPhase] = useState<"closed" | "pending" | "open">("closed");
  useEffect(() => {
    if (phase !== "pending") return;
    const timer = setTimeout(() => setPhase("open"), delay);
    return () => clearTimeout(timer);
  }, [phase, delay]);
  const show = () => setPhase((p) => (p === "closed" ? "pending" : p));
  const hide = () => setPhase("closed");

  const child = cloneElement(children, {
    "aria-describedby": id,
    onMouseEnter: (e) => { children.props.onMouseEnter?.(e); show(); },
    onMouseLeave: (e) => { children.props.onMouseLeave?.(e); hide(); },
    onFocus: (e) => { children.props.onFocus?.(e); show(); },
    onBlur: (e) => { children.props.onBlur?.(e); hide(); },
    onKeyDown: (e) => { children.props.onKeyDown?.(e); if (e.key === "Escape") hide(); },
  });

  return (
    <span className="relative inline-flex">
      {child}
      <span id={id} role="tooltip" hidden={phase !== "open"} className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-caption text-canvas shadow-window">
        {label}
      </span>
    </span>
  );
}
