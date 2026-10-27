import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";

/** Server-verified check for app pages: guests may browse (decisions 28–29);
 * signed-in users must first finish onboarding. */
export async function AppGate({ children }: { children: ReactNode }) {
  const s = await getSession();
  if (s && !s.profile?.onboarded_at) redirect("/onboarding");
  return <>{children}</>;
}
