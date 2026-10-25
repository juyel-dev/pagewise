import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const s = await getSession();
  const first = (s?.profile?.display_name || "there").split(" ")[0];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Hi {first}</h1>
        <p className="mt-1 text-sm text-ink-2">Daily goal: {s?.profile?.daily_goal ?? 20} questions · NEET {s?.profile?.neet_year ?? ""}</p>
      </div>
      <section aria-labelledby="resume" className="rounded-2xl border border-line bg-surface p-6">
        <h2 id="resume" className="text-lg font-semibold text-ink">Pick up where you left off</h2>
        <p className="mt-2 max-w-prose text-sm text-ink-2">
          You have not started a chapter yet. The first Biology chapters are being prepared and reviewed; they will appear in the library as soon as they are ready.
        </p>
        <ButtonLink href="/library" className="mt-4">Browse the library</ButtonLink>
      </section>
    </div>
  );
}
