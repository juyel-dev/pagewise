"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: boolean };
const CLASSES = ["11", "12", "dropper"] as const;
const GOALS = [10, 20, 40, 60];

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const mode = formData.get("mode") === "onboarding" ? "onboarding" : "settings";
  const name = String(formData.get("display_name") ?? "").trim();
  const cls = String(formData.get("class") ?? "");
  const year = Number(formData.get("neet_year"));
  const goal = Number(formData.get("daily_goal"));

  if (name.length < 2 || name.length > 60) return { error: "Please enter your name (2 to 60 characters)." };
  if (!CLASSES.includes(cls as (typeof CLASSES)[number])) return { error: "Please choose your class." };
  const thisYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < thisYear || year > thisYear + 3) return { error: "Please choose your NEET year." };
  if (!GOALS.includes(goal)) return { error: "Please choose a daily goal." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const patch: Record<string, unknown> = { display_name: name, class: cls, neet_year: year, daily_goal: goal };
  if (mode === "onboarding") patch.onboarded_at = new Date().toISOString();
  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) return { error: "We could not save your details. Please try again." };

  if (mode === "onboarding") redirect("/home");
  return { ok: true };
}
