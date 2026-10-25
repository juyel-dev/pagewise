import { Bookmark, Columns2, Keyboard, Languages, LayoutList, Moon, Target, TrendingUp, type LucideIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";

type Feature = { icon: LucideIcon; title: string; body: string; soon?: boolean };
const features: Feature[] = [
  { icon: Columns2, title: "Split-screen workspace", body: "The NCERT page and your questions side by side. Drag the divider to fit your screen." },
  { icon: LayoutList, title: "Focus mode or full list", body: "One question at a time to concentrate, or every question for the page in a list. You choose, any time." },
  { icon: Target, title: "Real NEET question styles", body: "MCQs, assertion–reason, statement-based and match-the-column, not just plain recall." },
  { icon: Keyboard, title: "Built for laptops", body: "Answer, check and move on without touching the mouse. Dark mode for late-night revision." },
  { icon: Bookmark, title: "Bookmarks & mistake notebook", body: "Save tricky questions and revisit every one you got wrong.", soon: true },
  { icon: TrendingUp, title: "Progress by chapter", body: "See accuracy per chapter and spot weak topics before they cost you marks.", soon: true },
  { icon: Languages, title: "Your language", body: "English first, then Hindi and other Indian languages across the interface and questions.", soon: true },
  { icon: Moon, title: "Phone-friendly experience", body: "A layout designed for small screens, following the laptop launch.", soon: true },
];

export function Features() {
  return (
    <Section id="features" tone="tint" eyebrow="Features" title="Everything you need to study one page at a time" description="Focused on what helps you retain NCERT Biology, without noise or distractions.">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => <li key={f.title} className={cn("flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card", f.soon && "bg-surface/60")}>
          <div className="flex items-start justify-between"><span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand-text"><f.icon className="size-5" aria-hidden /></span>
          {f.soon && <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted">Coming soon</span>}</div>
          <h3 className="mt-4 text-base font-semibold">{f.title}</h3><p className="mt-1.5 text-sm leading-6 text-ink-2">{f.body}</p>
        </li>)}
      </ul>
    </Section>
  );
}
