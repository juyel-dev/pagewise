"use client";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { safeNext } from "@/lib/auth/safe-next";
import { flags } from "@/lib/flags";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type Status = "idle" | "sending" | "sent" | "error";

export function SignInForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(params.get("error") === "link" ? "That sign-in link did not work or has expired. Please request a new one." : "");

  async function onGoogle() {
    if (!hasSupabaseEnv) { setStatus("error"); setMessage("Sign-in is not configured yet."); return; }
    setStatus("sending"); setMessage("");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setStatus("error"); setMessage("Google sign-in did not start. Please try again or use email."); }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasSupabaseEnv) { setStatus("error"); setMessage("Sign-in is not configured yet."); return; }
    setStatus("sending"); setMessage("");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setStatus("error"); setMessage(error.status === 429 ? "Too many requests. Please wait a few minutes and try again." : "We could not send the link. Check the email address and try again."); return; }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold text-ink">Check your email</h2>
        <p className="mt-2 text-sm text-ink-2">We sent a sign-in link to <strong>{email}</strong>. Open it on this device and browser.</p>
        <button className="mt-4 text-sm font-medium text-brand-text underline" onClick={() => setStatus("idle")}>Use a different email</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
    {flags.googleAuth && (
      <>
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
        <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      </>
    )}
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">Email address</label>
        <input id="email" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-field px-3 text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring"
          placeholder="you@example.com" aria-describedby={message ? "signin-msg" : undefined} />
      </div>
      {message && <p id="signin-msg" role="alert" className="text-sm text-bad">{message}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={status === "sending" || !email.includes("@")}>
        {status === "sending" ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
    </div>
  );
}
