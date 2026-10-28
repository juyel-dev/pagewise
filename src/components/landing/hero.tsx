import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { brand } from "@/config/brand";

/** Mock frame 1: minimal hero — headline, one Google CTA, book illustration. */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden pt-14 pb-0 sm:pt-20">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(58%_58%_at_50%_0%,var(--brand-soft),transparent)]" />
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 id="hero-heading" className="text-[2.6rem] leading-[1.06] font-semibold tracking-tight text-ink sm:text-6xl">Study Smarter.<br />Score Higher.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-ink-2 text-pretty sm:text-xl sm:leading-9">NEET Biology made simple with page-based questions, smart tracking and focused learning.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/start" size="lg" className="w-full sm:w-auto">
              <GoogleMark />
              Continue with Google
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted">Your progress. Your pace. Your NEET. · <a href="/library" className="font-medium text-brand-text underline underline-offset-2">Explore as a guest</a></p>
        </div>
        <div className="mt-10 flex justify-center pb-10 sm:mt-14 sm:pb-16"><BookIllustration /></div>
      </Container>
    </section>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/** Flat open book with a young plant — inline SVG, themed with brand tokens. */
function BookIllustration() {
  return (
    <svg viewBox="0 0 360 200" className="w-full max-w-md text-line" role="img" aria-label={`${brand.name} illustration: an open textbook with a young plant growing from it.`}>
      <ellipse cx="180" cy="172" rx="120" ry="14" fill="var(--brand-soft)" />
      {/* pages */}
      <path d="M40 96 C 86 78, 140 82, 178 100 L178 152 C 140 134, 86 130, 40 148 Z" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      <path d="M320 96 C 274 78, 220 82, 182 100 L182 152 C 220 134, 274 130, 320 148 Z" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      <path d="M40 148 C 86 130, 140 134, 178 152 L178 160 C 140 142, 86 138, 40 156 Z" fill="var(--surface-2)" />
      <path d="M320 148 C 274 130, 220 134, 182 152 L182 160 C 220 142, 274 138, 320 156 Z" fill="var(--surface-2)" />
      {/* text lines */}
      <g opacity="0.55">
        <g fill="var(--line)"><rect x="66" y="102" width="76" height="6" rx="3" /><rect x="66" y="114" width="66" height="6" rx="3" /><rect x="66" y="126" width="74" height="6" rx="3" /></g>
        <g fill="var(--line)"><rect x="228" y="102" width="76" height="6" rx="3" /><rect x="228" y="114" width="66" height="6" rx="3" /><rect x="228" y="126" width="74" height="6" rx="3" /></g>
      </g>
      {/* plant */}
      <path d="M196 62 C 196 78, 190 92, 182 100" stroke="var(--good)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M196 62 C 190 48, 178 42, 166 44 C 170 56, 182 62, 196 62 Z" fill="var(--good)" opacity="0.85" />
      <path d="M196 62 C 202 44, 214 38, 228 42 C 224 56, 210 64, 196 62 Z" fill="var(--good)" />
      <path d="M194 70 C 180 68, 168 60, 162 48" stroke="var(--good)" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* cloud accents */}
      <ellipse cx="60" cy="52" rx="26" ry="10" fill="var(--brand-soft)" opacity="0.7" />
      <ellipse cx="298" cy="40" rx="34" ry="12" fill="var(--brand-soft)" opacity="0.7" />
    </svg>
  );
}
