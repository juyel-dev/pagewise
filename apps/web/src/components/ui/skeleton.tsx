import { cn } from "@/lib/cn";

/** A loading placeholder block. Size it like the real content so nothing jumps when data arrives. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-md", className)} />;
}

/** Wrap a group of skeletons so assistive tech hears one “Loading”. */
export function SkeletonGroup({ label = "Loading", className, children }: { label?: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
