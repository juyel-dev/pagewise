import { FileSearch, Flag, ShieldCheck, Sparkles } from "lucide-react";
import { Section } from "@/components/ui/section";

const steps = [
  { icon: Sparkles, title: "Written from the page", body: "Questions are created from the NCERT page itself, never from memory or guesswork." },
  { icon: FileSearch, title: "Checked against the page", body: "Each answer is checked again against the same page text, and anything unsupported is held back." },
  { icon: ShieldCheck, title: "Reviewed by students", body: "Medical students and strong NEET scorers review questions before they go live." },
  { icon: Flag, title: "Fixed when you flag it", body: "See something wrong? Report it in one tap. Flagged questions are pulled and re-checked." },
];

export function Accuracy() {
  return (
    <Section id="accuracy" eyebrow="Accuracy" title="Accuracy is the product" description="A wrong answer costs you marks. So every question goes through a review process before you ever see it.">
      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => <li key={s.title} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">{i + 1}</span><s.icon className="size-5 text-brand-text" aria-hidden /></div>
          <h3 className="mt-4 text-base font-semibold">{s.title}</h3><p className="mt-1.5 text-sm leading-6 text-ink-2">{s.body}</p>
        </li>)}
      </ol>
      <p className="mt-8 max-w-3xl text-sm leading-6 text-muted">{`Practice questions support your reading. They don't replace the NCERT textbook, your teachers, or your own judgement. Always cross-check with the book.`}</p>
    </Section>
  );
}
