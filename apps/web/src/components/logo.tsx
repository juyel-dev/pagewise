import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

/** Brand mark: a page split in two (read | practise). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      aria-hidden
      focusable="false"
    >
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <rect x="7" y="8" width="8" height="16" rx="2" fill="#fff" opacity="0.95" />
      <rect x="17" y="8" width="8" height="16" rx="2" fill="#fff" opacity="0.55" />
      <path d="M19.2 16.4l1.7 1.7 3-3.4" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">{brand.name}</span>
    </span>
  );
}
