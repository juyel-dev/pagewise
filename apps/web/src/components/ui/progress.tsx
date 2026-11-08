import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "good" | "brand" | "accent" | "bad";
const fills: Record<Tone, string> = { good: "bg-good", brand: "bg-brand", accent: "bg-accent", bad: "bg-bad" };
const strokes: Record<Tone, string> = { good: "stroke-good", brand: "stroke-brand", accent: "stroke-accent", bad: "stroke-bad" };

const clampPct = (value: number, max: number) => (max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100)));

type BarProps = { value: number; max?: number; label: string; tone?: Tone; className?: string };
/** Linear progress. `label` is the accessible name; show the visible text next to it yourself. */
export function ProgressBar({ value, max = 100, label, tone = "good", className }: BarProps) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(max, Math.max(0, value))} className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none", fills[tone])} style={{ width: `${clampPct(value, max)}%` }} />
    </div>
  );
}

type RingProps = { value: number; max?: number; label: string; size?: number; stroke?: number; tone?: Tone; children?: ReactNode; className?: string };
/** Circular progress with centred content (for example “12 / 20”). */
export function ProgressRing({ value, max = 100, label, size = 96, stroke = 8, tone = "brand", children, className }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = clampPct(value, max);
  return (
    <div role="img" aria-label={label} className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-2" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} className={cn("transition-[stroke-dashoffset] duration-200 motion-reduce:transition-none", strokes[tone])} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center">{children}</div>
    </div>
  );
}
