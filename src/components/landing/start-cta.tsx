import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { brand } from "@/config/brand";

/** Final CTA shown while the app is open (screens/01b; decision 17's open state). */
export function StartCta() {
  return (
    <section id="start" aria-labelledby="start-heading" className="relative py-20 sm:py-28">
      <Container>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-line bg-surface p-8 text-center shadow-window sm:p-12">
          <div aria-hidden className="absolute inset-x-0 top-0 -z-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,var(--brand-soft),transparent)]" />
          <div className="relative">
            <h2 id="start-heading" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Start practising today</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-ink-2 text-pretty">Open {brand.name} and read the NCERT page with questions from that exact page beside it.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/sign-in?next=%2Fhome" size="lg">Continue with Google</ButtonLink>
              <ButtonLink href="/library" variant="secondary" size="lg">Browse as a guest</ButtonLink>
            </div>
            <p className="mt-6 text-xs text-muted">Guests can read every chapter and try 2 questions per page. Sign in any time to save your progress.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
