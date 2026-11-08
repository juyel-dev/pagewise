import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "flat" | "raised" | "interactive";
type Padding = "none" | "sm" | "md" | "lg";
const variants: Record<Variant, string> = {
  flat: "",
  raised: "shadow-card",
  interactive: "transition-colors hover:bg-surface-2 active:scale-[0.995] motion-reduce:active:scale-100",
};
const paddings: Record<Padding, string> = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

function cardClasses(variant: Variant, padding: Padding, className?: string) {
  return cn("rounded-2xl border border-line bg-surface", variants[variant], paddings[padding], className);
}

export function Card({ variant = "flat", padding = "md", className, ...props }: ComponentProps<"div"> & { variant?: Variant; padding?: Padding }) {
  return <div className={cardClasses(variant, padding, className)} {...props} />;
}

/** A whole card that is one link target (chapter cards). */
export function CardLink({ padding = "md", className, ...props }: ComponentProps<typeof Link> & { padding?: Padding }) {
  return <Link className={cn("block", cardClasses("interactive", padding, className))} {...props} />;
}
