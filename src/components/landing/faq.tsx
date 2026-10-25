import { Plus } from "lucide-react";
import { Section } from "@/components/ui/section";
import { brand } from "@/config/brand";

const faqs = [
  { q: "Is it free?", a: "The plan is for core practice to be free to start. If we add paid extras later, we'll tell you clearly before anything changes." },
  { q: "Does it replace the NCERT textbook?", a: "No. It sits beside the book. You still read NCERT; the practice questions help you remember and test what you just read." },
  { q: "Where does the NCERT page come from?", a: "We point you to NCERT's own official PDFs instead of hosting or repackaging the books ourselves." },
  { q: "Are these previous-year questions?", a: "No. They're original practice questions written for each page. Previous-year question mapping is on the longer-term roadmap." },
  { q: "Can the answers be wrong?", a: "We check and review every question, but mistakes can still happen. Use the report button and we'll re-check. Cross-check important facts with your textbook." },
  { q: "Which subjects and languages will you start with?", a: "Biology for Class 11 and 12, in English. Hindi and other Indian languages follow, then Physics and Chemistry." },
  { q: "Will it work on my phone?", a: "The first release is designed for laptops and desktops, where side-by-side reading works best. A phone-first experience is next." },
  { q: `Is ${brand.name} connected to NCERT or NTA?`, a: "No. It's an independent project and isn't affiliated with or endorsed by NCERT or NTA." },
];

export function Faq() {
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered" align="center" className="[&>div>div:last-child]:mx-auto [&>div>div:last-child]:max-w-3xl">
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {faqs.map((f) => <details key={f.q} className="group">
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium hover:bg-surface-2">{f.q}<Plus className="size-5 shrink-0 text-muted transition-transform group-open:rotate-45" aria-hidden /></summary>
          <p className="px-6 pb-6 text-[15px] leading-7 text-ink-2">{f.a}</p>
        </details>)}
      </div>
    </Section>
  );
}
