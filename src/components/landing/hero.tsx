import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { brand } from "@/config/brand";

const proof = ["Biology Class 11 & 12 first", "A source page for every question", "English now · Hindi & more next"];

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--brand-soft),transparent)]" />
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-2 shadow-sm"><span className="size-1.5 rounded-full bg-brand-ring" aria-hidden />{brand.exam} · Biology first · Opening soon</p>
          <h1 id="hero-heading" className="mt-6 text-[2.5rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">Read the NCERT page.<br /><span className="text-brand-text">Practise that same page.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink-2 text-pretty sm:text-xl sm:leading-9">{brand.name} puts the NCERT page and exam-style NEET questions from that exact page side by side, so everything you read turns straight into practice.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="#waitlist" size="lg" className="w-full sm:w-auto">Join the waitlist <ArrowRight className="size-4" aria-hidden /></ButtonLink>
            <ButtonLink href="#how-it-works" variant="secondary" size="lg" className="w-full sm:w-auto">See how it works</ButtonLink>
          </div>
          <ul className="mt-8 flex flex-col items-center justify-center gap-x-6 gap-y-2 text-sm text-muted sm:flex-row sm:flex-wrap">{proof.map((p) => <li key={p} className="flex items-center gap-2"><span className="size-1 rounded-full bg-brand-ring" aria-hidden />{p}</li>)}</ul>
        </div>
      </Container>
    </section>
  );
}
