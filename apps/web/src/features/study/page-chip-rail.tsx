"use client";

import { useRef, type KeyboardEvent } from "react";
import { Chip } from "@/components/ui/chip";

export type RailPage = { pdfPage: number; label: string; count: number; complete: boolean };

/** One chip per page that has questions. The practised page is selected; finished pages carry a green dot. ←/→ move between chips. */
export function PageChipRail({ pages, current, onSelect }: { pages: RailPage[]; current: number | null; onSelect: (pdfPage: number) => void }) {
  const list = useRef<HTMLUListElement>(null);
  if (pages.length === 0) return null;

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const chips = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const at = chips.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    e.preventDefault();
    chips[(at + (e.key === "ArrowRight" ? 1 : -1) + chips.length) % chips.length]?.focus();
  }

  return (
    <nav aria-label="Pages with questions" onKeyDown={onKeyDown}>
      <ul ref={list} className="flex gap-2 overflow-x-auto pb-1">
        {pages.map((p) => (
          <li key={p.pdfPage} className="shrink-0">
            <Chip selected={p.pdfPage === current} onClick={() => onSelect(p.pdfPage)}>
              p.{p.label}
              <span aria-hidden="true" className="tabular-nums opacity-80">{p.count}</span>
              <span className="sr-only">, {p.count} {p.count === 1 ? "question" : "questions"}{p.complete ? ", all answered" : ""}</span>
              {p.complete ? <span aria-hidden="true" className="size-1.5 rounded-full bg-good" /> : null}
            </Chip>
          </li>
        ))}
      </ul>
    </nav>
  );
}
