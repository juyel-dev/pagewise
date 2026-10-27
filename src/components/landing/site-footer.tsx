import Link from "next/link";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/container";
import { brand, navLinks } from "@/config/brand";
import { flags } from "@/lib/flags";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-2/60 py-12">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" aria-label="Home" className="inline-block rounded-full"><Logo /></Link>
            <p className="mt-3 text-sm leading-6 text-ink-2">{brand.tagline}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
              {navLinks.map((l) => <li key={l.href}><a href={l.href} className="text-ink-2 hover:text-ink hover:underline">{l.label}</a></li>)}
              <li><a href={flags.appOpen ? "/home" : "#waitlist"} className="text-ink-2 hover:text-ink hover:underline">{flags.appOpen ? "Open the app" : "Waitlist"}</a></li>
            </ul>
          </nav>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-xs leading-6 text-muted">
          <p>{brand.name} is an independent project and is not affiliated with, or endorsed by, NCERT or NTA. NCERT textbooks remain the property of NCERT. Practice questions are AI-assisted and student-reviewed; always cross-check with your textbook.</p>
          <p className="mt-2">© {brand.name}</p>
        </div>
      </Container>
    </footer>
  );
}
