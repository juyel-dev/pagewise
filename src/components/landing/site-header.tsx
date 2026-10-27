import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { navLinks } from "@/config/brand";
import { flags } from "@/lib/flags";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Home" className="rounded-full"><Logo /></Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((l) => <li key={l.href}><a href={l.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">{l.label}</a></li>)}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Wrapper (not a `hidden` class on the button): Button's base `inline-flex` would win the conflict. */}
          <div className="hidden sm:block">{flags.appOpen ? <ButtonLink href="/home">Open the app</ButtonLink> : <ButtonLink href="#waitlist">Join the waitlist</ButtonLink>}</div>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
