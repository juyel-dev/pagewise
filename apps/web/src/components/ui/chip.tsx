import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ChipProps = ComponentProps<"button"> & { selected?: boolean; count?: number; icon?: ReactNode };
/** Interactive filter/choice pill. Selection is announced with `aria-pressed`. */
export function Chip({ selected = false, count, icon, className, type = "button", children, ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-caption transition-colors pointer-coarse:h-11",
        selected ? "border-brand bg-brand-soft text-brand-text" : "border-line bg-surface text-ink-2 hover:bg-surface-2",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {count !== undefined && <span className="tabular-nums opacity-80">{count}</span>}
    </button>
  );
}

type Tone = "neutral" | "brand" | "good" | "bad" | "accent";
const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  brand: "bg-brand-soft text-brand-text",
  good: "bg-good-soft text-good",
  bad: "bg-bad-soft text-bad",
  accent: "bg-accent-soft text-accent-text",
};
/** Static status label (Live, Draft, Correct…). Always put meaning in the text, never in colour alone. */
export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption", tones[tone], className)} {...props} />;
}
