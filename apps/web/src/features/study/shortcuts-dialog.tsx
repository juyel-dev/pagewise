"use client";

import { Dialog } from "@/components/ui/dialog";
import { KeyHint } from "@/components/ui/key-hint";

const GROUPS: { title: string; rows: [string[], string][] }[] = [
  { title: "Questions", rows: [[["1", "–", "8"], "Choose an option"], [["Enter"], "Check, then go to the next question"], [["N"], "Next question"], [["Shift", "N"], "Previous question"], [["R"], "Try again"], [["B"], "Save or unsave the question"], [["S"], "Show in NCERT"], [["Q"], "Questions for the page I'm reading"]] },
  { title: "Reading", rows: [[["["], "Previous PDF page"], [["]"], "Next PDF page"], [["/"], "Go to a printed page"], [["V"], "Show or hide the PDF"]] },
  { title: "Help", rows: [[["?"], "This list"]] },
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard shortcuts" description="They work anywhere on this page except while you are typing.">
      <div className="flex flex-col gap-5">
        {GROUPS.map((g) => (
          <section key={g.title} aria-label={g.title}>
            <h3 className="text-label text-ink">{g.title}</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {g.rows.map(([keys, label]) => (
                <li key={label} className="flex items-center justify-between gap-4 text-small text-ink-2">
                  <span>{label}</span>
                  <span className="flex shrink-0 items-center gap-1">{keys.map((k, i) => (k === "–" ? <span key={i} aria-hidden="true">–</span> : <KeyHint key={i}>{k}</KeyHint>))}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
