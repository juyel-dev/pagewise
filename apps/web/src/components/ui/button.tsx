import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base = "inline-flex select-none items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover shadow-sm",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-2 shadow-sm",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "bg-bad text-white hover:opacity-90 shadow-sm",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm pointer-coarse:h-11",
  md: "h-10 px-4 text-sm pointer-coarse:h-11",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type Common = { variant?: Variant; size?: Size; fullWidth?: boolean; leadingIcon?: ReactNode; trailingIcon?: ReactNode };

type ButtonProps = ComponentProps<"button"> & Common & { loading?: boolean };
/** Primary action control. `loading` keeps the label (width does not jump), shows a spinner and disables the button. */
export function Button({ variant, size, fullWidth, leadingIcon, trailingIcon, loading, disabled, className, type = "button", children, ...props }: ButtonProps) {
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClasses(variant, size, cn(fullWidth && "w-full", className))} {...props}>
      {loading ? <Spinner /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & Common;
export function ButtonLink({ variant, size, fullWidth, leadingIcon, trailingIcon, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, cn(fullWidth && "w-full", className))} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
