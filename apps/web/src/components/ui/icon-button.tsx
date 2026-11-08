import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Props = ComponentProps<"button"> & {
  /** Required: icon-only controls need an accessible name. */
  label: string;
  variant?: "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
};
const sizes = { sm: "size-8", md: "size-10", lg: "size-12" } as const;

export function IconButton({ label, variant = "ghost", size = "md", className, type = "button", children, ...props }: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50 pointer-coarse:min-h-11 pointer-coarse:min-w-11",
        variant === "secondary" ? "border border-line bg-surface text-ink hover:bg-surface-2" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
