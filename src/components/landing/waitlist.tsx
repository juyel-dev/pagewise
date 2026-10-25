import { Container } from "@/components/ui/container";
import { brand } from "@/config/brand";
import { WaitlistForm } from "./waitlist-form";

export function Waitlist() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-heading" className="relative py-20 sm:py-28">
      <Container>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-line bg-surface p-8 text-center shadow-window sm:p-12">
          <div aria-hidden className="absolute inset-x-0 top-0 -z-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,var(--brand-soft),transparent)]" />
          <div className="relative">
            <h2 id="waitlist-heading" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Be first in when {brand.name} opens</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-ink-2 text-pretty">Early members get Biology first and a say in what we build next.</p>
            <div className="mx-auto mt-8 max-w-xl"><WaitlistForm /></div>
          </div>
        </div>
      </Container>
    </section>
  );
}
