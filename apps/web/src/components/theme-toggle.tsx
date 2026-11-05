"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Both icons are rendered and swapped with CSS (`dark:` variant) so the
 * server and client markup are identical — no hydration flicker, no mounted
 * state needed.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle dark mode" className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
      <Moon className="size-[18px] dark:hidden" aria-hidden />
    </button>
  );
}
