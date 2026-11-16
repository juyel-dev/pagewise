import { cn } from "@/lib/cn";

export type StudyTab = "read" | "practise";

/** Phone Read | Practise switch (full width, 44 px). The panes stay mounted so scroll and answers are kept. */
export function StudyTabs({ value, onChange, showRead, practiseLabel }: { value: StudyTab; onChange: (t: StudyTab) => void; showRead: boolean; practiseLabel: string }) {
  const tabs: { id: StudyTab; label: string }[] = [...(showRead ? [{ id: "read" as const, label: "Read" }] : []), { id: "practise", label: practiseLabel }];
  return (
    <div role="tablist" aria-label="Study panels" className="flex shrink-0 border-b border-line bg-surface lg:hidden">
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" id={`study-tab-${t.id}`} aria-selected={value === t.id} aria-controls={`study-pane-${t.id}`} onClick={() => onChange(t.id)}
          className={cn("h-11 flex-1 border-b-2 text-label transition-colors", value === t.id ? "border-brand text-brand-text" : "border-transparent text-ink-2")}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
