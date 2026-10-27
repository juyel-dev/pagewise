"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { safeNext } from "@/lib/auth/safe-next";
import { flags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/** Google-only sign-in (decision 27) with a guest path (decision 28). */
export function SignInForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const guestHref = next || "/library";
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState(params.get("error") ? "That sign-in did not complete. Try again, or continue as a guest." : "");

  async function onGoogle() {
    if (!hasSupabaseEnv || !flags.googleAuth) { setStatus("error"); setMessage("Google sign-in is not enabled yet. You can continue as a guest for now."); return; }
    setStatus("sending"); setMessage("");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setStatus("error"); setMessage("Google sign-in did not start. Please try again, or continue as a guest."); }
  }

  return (
    <div className="space-y-3">
      {flags.googleAuth ? (
        <button type="button" onClick={onGoogle} disabled={status === "sending"}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-surface px-6 text-base font-medium text-ink shadow-sm transition-colors hover:bg-surface-2 disabled:opacity-50">
          <svg viewBox="0 0 48 48" className="size-5" aria-hidden focusable="false">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
            <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z" />
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
          </svg>
          Continue with Google
        </button>
      ) : (
        <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-2">Google sign-in is being set up. For now, continue as a guest.</p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <Link href={guestHref}
        className={cn("flex h-12 w-full items-center justify-center rounded-full border border-line bg-surface px-6 text-base font-medium text-ink border-line shadow-sm transition-colors hover:bg-surface-2")}>
        Continue as guest
      </Link>
      <p className="text-xs leading-5 text-muted">Guests can read every chapter page and try the first 2 questions on a page. Sign in to save bookmarks, progress and attempts.</p>
      {message && <p role="alert" className="text-sm text-bad">{message}</p>}
    </div>
  );
}
