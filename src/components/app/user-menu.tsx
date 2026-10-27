import Link from "next/link";
import { getSession } from "@/lib/auth/session";

export async function UserMenu() {
  const s = await getSession();
  if (!s) {
    return (
      <Link href="/sign-in" className="flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-hover">
        Sign in
      </Link>
    );
  }
  const name = s.profile?.display_name || s.user.email;
  return (
    <details className="relative">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm text-ink hover:bg-surface-2">
        <span aria-hidden className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-semibold text-white">{name.slice(0, 1).toUpperCase()}</span>
        <span className="max-w-[8rem] truncate">{name}</span>
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-line bg-surface p-2 shadow-lg">
        <p className="truncate px-2 py-1 text-xs text-muted">{s.user.email}</p>
        {(s.profile?.role === "admin" || s.profile?.role === "reviewer") && (
          <Link href="/review" className="block rounded-lg px-2 py-2 text-sm text-ink hover:bg-surface-2">Review questions</Link>
        )}
        {s.profile?.role === "admin" && <Link href="/admin/import" className="block rounded-lg px-2 py-2 text-sm text-ink hover:bg-surface-2">Import questions</Link>}
        <form action="/auth/signout" method="post">
          <button type="submit" className="w-full rounded-lg px-2 py-2 text-left text-sm text-ink hover:bg-surface-2">Sign out</button>
        </form>
      </div>
    </details>
  );
}
