import type { Metadata } from "next";
import { ProfileForm } from "@/features/profile/profile-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await getSession();
  const now = new Date();
  const first = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  const saved = s?.profile?.neet_year;
  const years = [first, first + 1, first + 2];
  if (saved && !years.includes(saved)) years.unshift(saved);
  return (
    <div className="max-w-md space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-2">Signed in as {s?.user.email}</p>
      </div>
      <ProfileForm mode="settings" years={years}
        initial={{ display_name: s?.profile?.display_name ?? "", class: s?.profile?.class ?? null, neet_year: saved ?? null, daily_goal: s?.profile?.daily_goal ?? 20 }} />
      <section aria-labelledby="privacy" className="rounded-2xl border border-line bg-surface p-4">
        <h2 id="privacy" className="font-semibold text-ink">Your data</h2>
        <p className="mt-1 text-sm text-ink-2">Export and delete-account controls are added before public launch. Until then, email us and we will do it for you.</p>
      </section>
    </div>
  );
}
