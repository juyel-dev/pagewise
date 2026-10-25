import { BookOpen, ListChecks, Repeat } from "lucide-react";
import { Section } from "@/components/ui/section";

const steps = [
  { icon: BookOpen, title: "Open a chapter", body: "Pick Class 11 or 12, then a Biology chapter. The NCERT page opens beside your practice area." },
  { icon: ListChecks, title: "Practise the page you just read", body: "Answer NEET-style questions written for that page. Check instantly, read the explanation, jump to the source page." },
  { icon: Repeat, title: "Turn mistakes into revision", body: "Bookmark tricky questions and revisit the ones you missed, so weak topics get stronger every week." },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" eyebrow="How it works" title="Three steps from reading to retention" description="No tab-juggling. One calm workspace, built around the way you already study.">
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => <li key={s.title} className="relative rounded-2xl border border-line bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-text"><s.icon className="size-5" aria-hidden /></span>
            <span className="text-sm font-semibold text-muted tabular-nums">0{i + 1}</span>
          </div>
          <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
          <p className="mt-2 text-[15px] leading-7 text-ink-2">{s.body}</p>
        </li>)}
      </ol>
    </Section>
  );
}
