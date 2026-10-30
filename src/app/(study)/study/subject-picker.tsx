"use client";
import Link from "next/link";
import { setStudyPrefs } from "@/features/study/actions";
import { CLASSES, SUBJECTS, pairKey } from "@/features/study/hub";

const chip = "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors";
const chipOn = `${chip} bg-brand-soft text-brand-text`;
const chipOff = `${chip} border border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink`;

type Props = { subject: string; classNo: string; counts: Record<string, number>; signedIn: boolean };

/** Subject × Class chips (spec §2–3). Chips are real links so the selection lives in the URL
 * (`/study?subject=…&class=…`); signed-in users also save it as a preference (spec §7). */
export function SubjectPicker({ subject, classNo: currentClass, counts, signedIn }: Props) {
  const save = (p: { subject?: string; class?: string }) => {
    if (signedIn) void setStudyPrefs(p);
  };
  return (
    <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Subject">
        <span className="w-14 shrink-0 text-xs text-muted">Subject</span>
        {SUBJECTS.map((s) => (
          <Link key={s} href={`/study?subject=${s}&class=${currentClass}`} aria-current={s === subject ? "true" : undefined}
            className={s === subject ? chipOn : chipOff} onClick={() => save({ subject: s, class: currentClass })}>
            {s}
            <span className={`ml-1.5 text-xs ${s === subject ? "text-brand-text/80" : "text-muted"}`} aria-label={(counts[pairKey(s, currentClass)] ?? 0) === 0 ? "no chapters yet" : `${counts[pairKey(s, currentClass)]} chapters`}>
              {counts[pairKey(s, currentClass)] ?? 0}
            </span>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Class">
        <span className="w-14 shrink-0 text-xs text-muted">Class</span>
        {CLASSES.map((c) => (
          <Link key={c} href={`/study?subject=${subject}&class=${c}`} aria-current={c === currentClass ? "true" : undefined}
            className={c === currentClass ? chipOn : chipOff} onClick={() => save({ subject, class: c })}>
            Class {c}
            <span className={`ml-1.5 text-xs ${c === currentClass ? "text-brand-text/80" : "text-muted"}`} aria-label={(counts[pairKey(subject, c)] ?? 0) === 0 ? "no chapters yet" : `${counts[pairKey(subject, c)]} chapters`}>
              {counts[pairKey(subject, c)] ?? 0}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
