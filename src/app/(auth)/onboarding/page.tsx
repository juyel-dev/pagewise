import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProfileForm } from "@/features/profile/profile-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };

async function OnboardingContent() {
  const s = await getSession();
  if (!s) redirect("/sign-in");
  if (s.profile?.onboarded_at) redirect("/home");
  const now = new Date();
  const first = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear(); // NEET is held in May
  const years = [first, first + 1, first + 2];
  return (
    <ProfileForm mode="onboarding" years={years}
      initial={{ display_name: s.profile?.display_name ?? "", class: s.profile?.class ?? null, neet_year: s.profile?.neet_year ?? null, daily_goal: s.profile?.daily_goal ?? 20 }} />
  );
}

export default function OnboardingPage() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <h1 className="text-2xl font-semibold text-ink">Welcome to PageWise</h1>
      <p className="mt-2 mb-6 text-sm text-ink-2">Three quick details so we can set up your practice. You can change them later.</p>
      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-surface-2" />}><OnboardingContent /></Suspense>
    </main>
  );
}
