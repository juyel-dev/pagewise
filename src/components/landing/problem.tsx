import { Container } from "@/components/ui/container";

const pains = [
  { title: "You read, then go hunting", body: "Finish a page, then search through question banks and apps to find something that matches it." },
  { title: "Questions don't point back", body: "When you get one wrong, there's no quick way to see which NCERT line it came from." },
  { title: "Revision loses context", body: "Notes, PDFs and tests live in different places, so the link between a line and a question fades." },
];

export function Problem() {
  return (
    <section aria-labelledby="problem-heading" className="border-y border-line bg-surface-2/60 py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold tracking-wide text-brand-text uppercase">Why it exists</p>
          <h2 id="problem-heading" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">NEET Biology lives in the NCERT line. Your practice should too.</h2>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {pains.map((p) => <li key={p.title} className="rounded-2xl border border-line bg-surface p-6 shadow-card"><h3 className="text-base font-semibold">{p.title}</h3><p className="mt-2 text-[15px] leading-7 text-ink-2">{p.body}</p></li>)}
        </ul>
      </Container>
    </section>
  );
}
