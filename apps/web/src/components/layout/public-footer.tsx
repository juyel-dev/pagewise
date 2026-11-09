import { useTranslations } from "next-intl";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/container";
import { brand } from "@/config/brand";
import { env } from "@/lib/env";

const linkClass = "text-small text-ink-2 hover:text-ink hover:underline underline-offset-4";

/** Public footer. Only links to pages that exist; Help joins when /help ships (B8). */
export function PublicFooter() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-line bg-surface py-12">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-small text-ink-2">{t("tagline")}</p>
          </div>
          <nav aria-label={t("navLabel")} className="grid grid-cols-2 gap-x-12 gap-y-6 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <p className="text-label text-ink">{t("study")}</p>
              <Link href="/study" className={linkClass}>{t("study")}</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-label text-ink">{t("legal")}</p>
              <Link href="/legal/terms" className={linkClass}>{t("terms")}</Link>
              <Link href="/legal/privacy" className={linkClass}>{t("privacy")}</Link>
            </div>
            {env.contactEmail ? (
              <div className="flex flex-col gap-2">
                <p className="text-label text-ink">{t("help")}</p>
                <a href={`mailto:${env.contactEmail}`} className={linkClass}>{t("contact")}</a>
              </div>
            ) : null}
          </nav>
        </div>
        <p className="max-w-2xl text-caption text-muted">{t("disclaimer", { name: brand.name })}</p>
      </Container>
    </footer>
  );
}
