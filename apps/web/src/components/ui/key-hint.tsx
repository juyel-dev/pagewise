import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** A keyboard key cap. Hidden on touch devices where shortcuts do not apply. */
export function KeyHint({ className, ...props }: ComponentProps<"kbd">) {
  return <kbd className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface-2 px-1 text-caption text-ink-2 pointer-coarse:hidden", className)} {...props} />;
}
