"use client";

import { useEffect, useState, type KeyboardEvent, type PointerEvent } from "react";
import { SPLIT_DEFAULT, SPLIT_HANDLE, clampRatio, splitBounds } from "./logic";

/** Two-pane resizer (pointer drag, keyboard ←/→ with Shift for big steps, Home/End, double-click reset, swap sides). */
export function useSplitPane() {
  // A callback ref kept in state: the element is available to effects and handlers without reading a ref during render.
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [ratio, setRatio] = useState(SPLIT_DEFAULT);
  const [width, setWidth] = useState(784);
  const [swap, setSwap] = useState(false);

  useEffect(() => {
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  const bounds = splitBounds(width, swap);
  const effectiveRatio = clampRatio(ratio, width, swap);
  const available = Math.max(1, width - SPLIT_HANDLE);
  const leftMin = swap ? 360 : 320;
  const rightMin = swap ? 320 : 360;
  const leftWidth = Math.max(leftMin, Math.min(available - rightMin, Math.round((available * effectiveRatio) / 100)));

  function moveTo(clientX: number) {
    const rect = el?.getBoundingClientRect();
    if (!rect) return;
    const usable = Math.max(1, rect.width - SPLIT_HANDLE);
    setRatio(clampRatio(((clientX - rect.left - SPLIT_HANDLE / 2) / usable) * 100, rect.width, swap));
  }

  return {
    attach: setEl, swap, ratio: effectiveRatio, bounds, leftWidth, leftMin, rightMin,
    toggleSwap: () => { setSwap((s) => !s); setRatio((r) => 100 - r); },
    reset: () => setRatio(swap ? 100 - SPLIT_DEFAULT : SPLIT_DEFAULT),
    handleProps: {
      onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
      },
      onPointerMove: (e: PointerEvent<HTMLDivElement>) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) moveTo(e.clientX); },
      onPointerUp: (e: PointerEvent<HTMLDivElement>) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); },
      onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
        const step = e.shiftKey ? 10 : 2;
        const b = splitBounds(width, swap);
        const set = (v: number) => { e.preventDefault(); setRatio(Math.max(b.min, Math.min(b.max, v))); };
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") set(effectiveRatio - step);
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") set(effectiveRatio + step);
        else if (e.key === "Home") set(b.min);
        else if (e.key === "End") set(b.max);
      },
    },
  };
}
