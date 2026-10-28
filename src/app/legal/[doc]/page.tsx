import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

type Props = { params: Promise<{ doc: string }> };
const docs: Record<string, { title: string }> = { terms: { title: "Terms of Service" }, privacy: { title: "Privacy Policy" } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc } = await params;
  return { title: docs[doc]?.title ?? "Legal", robots: { index: false } };
}

export function generateStaticParams() {
  return Object.keys(docs).map((doc) => ({ doc }));
}

export default async function LegalDocPage({ params }: Props) {
  const { doc } = await params;
  const meta = docs[doc];
  if (!meta) notFound();
  return (
    <>
      <SiteHeader />
      <main id="main" className="py-14"><Container>
        <article className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold text-ink">{meta.title}</h1>
          <p className="mt-4 text-sm leading-6 text-ink-2">
            Full {meta.title.toLowerCase()} will be published here before the public launch. Until then, the short version:
          </p>
          <ul className="mt-4 ml-5 list-disc space-y-2 text-sm leading-6 text-ink-2">
            <li>We collect only what is needed to run your account: your display name, Google account email and your study settings.</li>
            <li>Your study data (progress, bookmarks, attempts) is private to you.</li>
            <li>No advertising pixels; no sale of personal data. Anonymous analytics, if added, stay cookieless and aggregated.</li>
            <li>Adults 18+ during the closed beta; parental-consent flow before opening to minors (DPDP Act 2023).</li>
            <li>You can request export or deletion of your data at any time.</li>
          </ul>
          <p className="mt-6 text-sm text-muted"><Link href="/" className="underline underline-offset-2 hover:text-ink">← Back to the site</Link></p>
        </article>
      </Container></main>
      <SiteFooter />
    </>
  );
}
