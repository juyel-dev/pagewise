export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <span className="sr-only">Loading</span>
      <div className="h-7 w-1/3 animate-pulse rounded-lg bg-surface-2" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
      <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />
    </div>
  );
}
