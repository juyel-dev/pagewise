"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";

type Status = "idle" | "loading" | "done" | "error";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const goals = ["NEET 2027", "NEET 2028", "NEET 2029 or later", "Just exploring"];

export function WaitlistForm() {
  const configured = Boolean(brand.waitlistUrl);
  const emailId = useId();
  const goalId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!configured || status === "loading") return;
    const form = new FormData(e.currentTarget);
    // Honeypot: real users never fill this.
    if (String(form.get("company") ?? "").trim() !== "") { setStatus("done"); return; }
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const goal = String(form.get("goal") ?? "");
    if (!EMAIL_RE.test(email)) { setStatus("error"); setMessage("Please enter a valid email address."); return; }
    setStatus("loading");
    setMessage("");
    try {
      // Apps Script web apps don't send CORS headers, so we post "no-cors" and treat a resolved request as success (response is opaque).
      await fetch(brand.waitlistUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ email, goal, source: "landing" }) });
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the server. Please check your connection and try again.");
    }
  }
  if (status === "done") return (
    <div role="status" className="flex items-start gap-3 rounded-2xl border border-good/30 bg-good-soft p-5 text-left">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-good" aria-hidden />
      <div><p className="font-semibold text-ink">You&rsquo;re on the list.</p><p className="mt-1 text-sm leading-6 text-ink-2">We&rsquo;ll email you once when early access opens. Nothing else.</p></div>
    </div>
  );
  return (
    <form onSubmit={onSubmit} noValidate className="text-left">
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
          <div><label htmlFor={emailId} className="mb-1.5 block text-sm font-medium">Email</label><input id={emailId} name="email" type="email" inputMode="email" autoComplete="email" required disabled={!configured} placeholder="you@example.com" aria-describedby={`${emailId}-help`} aria-invalid={status === "error" || undefined} className="h-12 w-full rounded-xl border border-field bg-surface px-4 text-base text-ink placeholder:text-muted disabled:opacity-60" /></div>
          <div><label htmlFor={goalId} className="mb-1.5 block text-sm font-medium">I&rsquo;m aiming for</label><select id={goalId} name="goal" disabled={!configured} defaultValue={goals[0]} className="h-12 w-full rounded-xl border border-field bg-surface px-3 text-base text-ink disabled:opacity-60">{goals.map((g) => <option key={g}>{g}</option>)}</select></div>
        </div>
        <Button type="submit" size="lg" disabled={!configured || status === "loading"} className="w-full sm:col-span-2">
          {status === "loading" ? <><Loader2 className="size-4 animate-spin" aria-hidden /> Joining…</> : "Join the waitlist"}
        </Button>
      </div>
      <p id={`${emailId}-help`} className="mt-3 text-sm text-muted">{configured ? "We'll only use your email to tell you when early access opens." : "Waitlist signups open very soon. Check back shortly."}</p>
      <p role="alert" className="mt-2 min-h-5 text-sm font-medium text-bad">{status === "error" ? message : ""}</p>
    </form>
  );
}
