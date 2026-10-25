import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./container";

type SectionProps = {
  id?: string; eyebrow?: string; title: ReactNode; description?: ReactNode;
  align?: "left" | "center"; tone?: "plain" | "tint"; children: ReactNode; className?: string;
};

/** Standard landing section: eyebrow → H2 → lede → content. */
export function Section({ id, eyebrow, title, description, align = "left", tone = "plain", children, className }: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("py-20 sm:py-28", tone === "tint" && "border-y border-line bg-surface-2/60", className)}>
      <Container>
        <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
          {eyebrow && <p className="mb-3 text-sm font-semibold tracking-wide text-brand-text uppercase">{eyebrow}</p>}
          <h2 id={headingId} className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          {description && <p className="mt-4 text-lg leading-8 text-ink-2 text-pretty">{description}</p>}
        </div>
        <div className="mt-12 sm:mt-14">{children}</div>
      </Container>
    </section>
  );
}
