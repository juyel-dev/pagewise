import { NextResponse, type NextRequest } from "next/server";
import { redirectWithCookies, updateSession } from "./lib/supabase/proxy";

const PROTECTED = /^\/(home|library|progress|bookmarks|settings|onboarding|study|review|admin)(\/|$)/;

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!userId && PROTECTED.test(pathname)) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname + search);
    return redirectWithCookies(url, response);
  }
  if (userId && pathname === "/sign-in") return redirectWithCookies(new URL("/home", request.url), response);
  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|pdfjs/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mjs|bcmap|pfb|ttf)$).*)"],
};
