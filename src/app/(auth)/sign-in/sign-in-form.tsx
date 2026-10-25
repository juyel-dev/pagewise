"use client";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { safeNext } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type Status = "idle" | "sending" | "sent" | "error";

export function SignInForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(params.get("error") === "link" ? "That sign-in link did not work or has expired. Please request a new one." : "");

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
  );
}
