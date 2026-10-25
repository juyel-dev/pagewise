import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
const columns = [
 {label:"Launching first",tone:"now" as const,items:["NCERT Biology, Class 11 & 12","English interface and questions","Split-screen workspace for laptops","Focus mode and list mode","Instant answers with explanations"]},
 {label:"Next",tone:"next" as const,items:["Hindi and more Indian languages","Phone-first experience","Progress and weak-topic insights","Mistake notebook and bookmarks","Chapter tests and timed practice"]},
 {label:"Later",tone:"later" as const,items:["Physics and Chemistry","Full-length mock tests","Previous-year question mapping","Spaced-repetition revision","Doubt discussion and study groups"]},
];
const languages = [{name:"English",live:true},{name:"हिन्दी"},{name:"বাংলা"},{name:"অসমীয়া"},{name:"ગુજરાતી"},{name:"ಕನ್ನಡ"},{name:"മലയാളം"},{name:"मराठी"},{name:"ଓଡ଼ିଆ"},{name:"ਪੰਜਾਬੀ"},{name:"தமிழ்"},{name:"తెలుగు"},{name:"اردو"}];
export function Roadmap() {
 return <Section id="roadmap" tone="tint" eyebrow="Roadmap" title="Starting focused, growing carefully" description="We'd rather do Biology brilliantly than everything badly. Here's the plan.">
  <div className="grid gap-4 md:grid-cols-3">{columns.map(c=><div key={c.label} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
   <p className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold",c.tone==="now"&&"bg-brand text-white",c.tone==="next"&&"bg-brand-soft text-brand-text",c.tone==="later"&&"bg-surface-2 text-muted")}>{c.label}</p>
   <ul className="mt-5 space-y-3">{c.items.map(it=><li key={it} className="flex gap-3 text-[15px] leading-6 text-ink-2"><span aria-hidden className={cn("mt-2 size-1.5 shrink-0 rounded-full",c.tone==="now"?"bg-brand-ring":"bg-line")}/>{it}</li>)}</ul>
  </div>)}</div>
  <div className="mt-10 rounded-2xl border border-line bg-surface p-6 shadow-card"><h3 className="text-base font-semibold">Languages we&rsquo;re planning for</h3><p className="mt-1 text-sm text-ink-2">NEET is held in 13 languages. We start with English and add the rest in phases.</p>
  <ul className="mt-4 flex flex-wrap gap-2">{languages.map(l=><li key={l.name} className={cn("rounded-full border px-3.5 py-1.5 text-sm",l.live?"border-brand bg-brand-soft font-medium text-brand-text":"border-line bg-surface-2 text-ink-2")}>{l.name}</li>)}</ul></div>
 </Section>;
}
