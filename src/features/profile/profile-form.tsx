"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { saveProfile, type FormState } from "./actions";

type Props = {
  mode: "onboarding" | "settings";
  years: number[];
  initial: { display_name: string; class: string | null; neet_year: number | null; daily_goal: number };
};

const field = "mt-1 h-11 w-full rounded-xl border border-line bg-field px-3 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring";

export function ProfileForm({ mode, years, initial }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="mode" value={mode} />
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-ink">Your name</label>
        <input id="display_name" name="display_name" required minLength={2} maxLength={60} autoComplete="name" defaultValue={initial.display_name} className={field} />
      </div>
      <div>
        <label htmlFor="class" className="block text-sm font-medium text-ink">Class</label>
        <select id="class" name="class" required defaultValue={initial.class ?? ""} className={field}>
          <option value="" disabled>Choose…</option>
          <option value="11">Class 11</option><option value="12">Class 12</option><option value="dropper">Dropper / repeater</option>
        </select>
      </div>
      <div>
        <label htmlFor="neet_year" className="block text-sm font-medium text-ink">NEET year</label>
        <select id="neet_year" name="neet_year" required defaultValue={initial.neet_year ?? ""} className={field}>
          <option value="" disabled>Choose…</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="daily_goal" className="block text-sm font-medium text-ink">Daily goal (questions)</label>
        <select id="daily_goal" name="daily_goal" defaultValue={initial.daily_goal} className={field}>
          {[10, 20, 40, 60].map((g) => <option key={g} value={g}>{g} a day</option>)}
        </select>
      </div>
      <p className="text-xs text-muted">Language: English (Hindi and Bengali are planned).</p>
      {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm text-good">Saved.</p>}
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : mode === "onboarding" ? "Start practising" : "Save changes"}
      </Button>
    </form>
  );
}
