import { useTranslations } from "next-intl";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export type PublicNavLink = { href: string; label: string };

/**
 * Public header (landing, legal). `links` stays empty until the landing sections they point to exist
 * (build step B5), so there are never dead anchors.
 */
export function PublicHeader({ links = [] }: { links?: PublicNavLink[] }) {
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas">
      <Container className="flex h-16 items-center gap-6">
        <Link href="/" aria-label={t("publicHeader.homeLink")} className="rounded-full"><Logo /></Link>
        {links.length > 0 ? (
          <nav aria-label={t("publicHeader.navLabel")} className="hidden items-center gap-5 md:flex">
            {links.map((l) => <a key={l.href} href={l.href} className="text-label text-ink-2 hover:text-ink">{l.label}</a>)}
          </nav>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/sign-in" variant="ghost" className="hidden sm:inline-flex">{t("common.signIn")}</ButtonLink>
          <ButtonLink href="/study" variant="primary">{t("common.startStudying")}</ButtonLink>
        </div>
      </Container>
    </header>
  );
}
