/**
 * Static shell for the chapter workspace while the server resolves the chapter.
 * Kept close to the real layout (toolbar + two panes) so the navigation does not jump
 * when the chapter streams in.
 */
export function StudyFallback() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col" aria-busy="true" aria-label="Loading chapter">
      <div className="border-b border-line bg-surface px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 w-20 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-4 w-44 max-w-[16rem] flex-1 animate-pulse rounded bg-surface-2" />
          <div className="h-9 w-36 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-2" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(320px,2fr)_12px_minmax(360px,3fr)]">
        <div className="min-h-0 flex-1 space-y-3 overflow-hidden bg-surface p-4">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-3 w-64 animate-pulse rounded bg-surface-2" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-surface-2" />
        </div>
        <div aria-hidden className="hidden bg-surface-2 lg:block" />
        <div className="hidden min-h-0 flex-1 bg-canvas p-4 lg:block">
          <div className="mx-auto h-full w-full max-w-3xl animate-pulse rounded-xl bg-surface-2" />
        </div>
      </div>
    </div>
  );
}

/** Static shell for the Study hub while chapters resolve. */
export function StudyHubFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6" aria-busy="true" aria-label="Loading Study">
      <div className="h-8 w-24 animate-pulse rounded bg-surface-2" />
      <div className="mt-2 h-4 w-full max-w-prose animate-pulse rounded bg-surface-2" />
      <div className="mt-4 space-y-4">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-20 w-full animate-pulse rounded-2xl bg-surface-2" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
