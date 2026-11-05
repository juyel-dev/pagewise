import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv, supabaseKey, supabaseUrl } from "./env";

/** Refreshes the auth cookies on every matched request and reports whether a signed-in user exists. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabaseEnv) return { response, userId: null as string | null };

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  return { response, userId: (data?.claims?.sub as string | undefined) ?? null };
}

/** Redirect while keeping any refreshed auth cookies. */
export function redirectWithCookies(to: URL, from: NextResponse) {
  const res = NextResponse.redirect(to);
  for (const c of from.cookies.getAll()) res.cookies.set(c);
  return res;
}
