import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  display_name: string; class: "11" | "12" | "dropper" | null; neet_year: number | null;
  daily_goal: number; onboarded_at: string | null; role: "student" | "reviewer" | "admin";
};

/** One verified lookup per request. Returns null when signed out. */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("display_name, class, neet_year, daily_goal, onboarded_at, role")
    .eq("id", user.id)
    .single();
  return { user: { id: user.id, email: user.email ?? "" }, profile: (data as Profile | null) };
});
