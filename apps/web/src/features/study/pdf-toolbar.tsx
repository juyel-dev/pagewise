"use client";

import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Switch } from "@/components/ui/field";

type Props = {
  page: number; total: number; label: string; hasSource: boolean;
  onPrevious: () => void; onNext: () => void;
  jump: string; onJumpChange: (v: string) => void; onJumpSubmit: () => void; jumpInput: RefObject<HTMLInputElement | null>;
  zoom: number; onZoom: (next: number) => void;
  dark: boolean; onDark: (v: boolean) => void;
  showViewer: boolean; onToggleViewer: () => void; onSwap: () => void;
  /** Staff-only extras (upload button). */
  extra?: ReactNode;
};

/** PDF controls above the page: turn page, jump to a printed page, zoom, invert, swap sides, hide. */
export function PdfToolbar({ jumpInput, ...p }: Props) {
  const zoomBy = (d: number) => p.onZoom(Math.min(3, Math.max(0.5, +(p.zoom + d).toFixed(2))));
  return (
    <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-line bg-surface px-3 py-1">
      <IconButton label="Previous page" size="sm" onClick={p.onPrevious} disabled={p.page <= 1 || !p.hasSource}><ChevronLeft className="size-5" aria-hidden="true" /></IconButton>
      <span className="min-w-28 text-center text-small text-ink-2 tabular-nums" aria-live="polite">PDF {p.page}/{p.total} · printed {p.label}</span>
      <IconButton label="Next page" size="sm" onClick={p.onNext} disabled={p.page >= p.total || !p.hasSource}><ChevronRight className="size-5" aria-hidden="true" /></IconButton>
      <input ref={jumpInput} value={p.jump} onChange={(e) => p.onJumpChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && p.onJumpSubmit()} inputMode="numeric"
        aria-label="Go to printed page" placeholder="Go to page" className="h-8 w-28 rounded-lg border border-control-border bg-field px-2 text-small text-ink placeholder:text-muted pointer-coarse:h-11" />
      <div className="flex items-center gap-1" role="group" aria-label="PDF zoom">
        <IconButton label="Zoom out" size="sm" onClick={() => zoomBy(-0.1)}><Minus className="size-4" aria-hidden="true" /></IconButton>
        <span className="w-10 text-center text-small tabular-nums text-ink-2">{Math.round(p.zoom * 100)}%</span>
        <IconButton label="Zoom in" size="sm" onClick={() => zoomBy(0.1)}><Plus className="size-4" aria-hidden="true" /></IconButton>
      </div>
      <div className="ml-auto hidden items-center gap-3 lg:flex">
        <Switch label="Invert pages" checked={p.dark} onCheckedChange={p.onDark} className="min-h-0" />
        <Button variant="ghost" size="sm" onClick={p.onSwap}>Swap sides</Button>
        <Button variant="ghost" size="sm" onClick={p.onToggleViewer}>{p.showViewer ? "Hide" : "Show"} PDF (V)</Button>
        {p.extra}
      </div>
      <details className="relative ml-auto lg:hidden">
        <summary className="inline-flex h-8 cursor-pointer list-none items-center rounded-full border border-line bg-surface px-3 text-label text-ink hover:bg-surface-2 pointer-coarse:h-11">More</summary>
        <div className="absolute right-0 z-30 mt-2 flex w-56 flex-col gap-2 rounded-xl border border-line bg-surface p-3 shadow-window">
          <Switch label="Invert pages" checked={p.dark} onCheckedChange={p.onDark} />
          <Button variant="secondary" size="sm" onClick={p.onToggleViewer}>{p.showViewer ? "Hide PDF" : "Show PDF"}</Button>
          {p.extra}
        </div>
      </details>
    </div>
  );
}
