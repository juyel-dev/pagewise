import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";

/** Server-verified check behind every signed-in page: must be signed in and onboarded. */
export async function AppGate({ children }: { children: ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/sign-in");
  if (!s.profile?.onboarded_at) redirect("/onboarding");
  return <>{children}</>;
}
