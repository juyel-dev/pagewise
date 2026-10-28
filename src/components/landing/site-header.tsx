import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Home" className="rounded-full"><Logo /></Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/sign-in" variant="secondary" size="md">Login</ButtonLink>
        </div>
      </Container>
    </header>
  );
}
