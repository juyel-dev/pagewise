"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/** The line of the book a question is based on. Long quotes clamp to three lines with a More toggle. */
export function SourceQuote({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 160;
  return (
    <div className="rounded-r-lg border-l-[3px] border-accent bg-accent-soft px-3 py-2">
      <p className={cn("text-small text-ink", long && !open && "line-clamp-3")}>
        <span className="font-medium">From the page: </span>“{text}”
      </p>
      {long ? (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-1 text-caption text-accent-text underline-offset-2 hover:underline">
          {open ? "Less" : "More"}
        </button>
      ) : null}
    </div>
  );
}
