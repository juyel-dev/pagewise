import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { brand } from "@/config/brand";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-2/60 py-10">
      <Container>
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="flex items-center gap-2 text-ink"><LogoMark className="size-6" /><span className="font-semibold">{brand.name}</span></span>
          <nav aria-label="Footer" className="flex items-center gap-5 text-sm">
            <Link href="/legal/terms" className="text-ink-2 underline-offset-4 hover:text-ink hover:underline">Terms of Service</Link>
            <Link href="/legal/privacy" className="text-ink-2 underline-offset-4 hover:text-ink hover:underline">Privacy Policy</Link>
          </nav>
          <p className="max-w-2xl text-xs leading-6 text-muted">
            {brand.name} is an independent project and is not affiliated with, or endorsed by, NCERT or NTA. NCERT textbooks remain the property of NCERT. Always cross-check with your textbook.
          </p>
          <p className="text-xs text-muted">© {brand.name}</p>
        </div>
      </Container>
    </footer>
  );
}
