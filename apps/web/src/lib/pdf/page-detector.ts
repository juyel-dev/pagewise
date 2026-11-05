/**
 * Scroll-based page detection (blueprint 09 §3).
 * Rules: largest visible area wins (ties -> earlier page); a change is emitted only after the candidate
 * has been stable for `stableMs`; programmatic jumps suppress detection briefly.
 */
export type PageDetectorOptions = {
  stableMs?: number;
  suppressMs?: number;
  now?: () => number;
  onChange: (page: number) => void;
};

export class PageDetector {
  private visible = new Map<number, number>();
  private candidate: number | null = null;
  private current: number | null = null;
  private suppressUntil = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly stableMs: number;
  private readonly suppressMs: number;
  private readonly now: () => number;

  constructor(private readonly opts: PageDetectorOptions) {
    this.stableMs = opts.stableMs ?? 400;
    this.suppressMs = opts.suppressMs ?? 700;
    this.now = opts.now ?? (() => Date.now());
  }

  get page(): number | null { return this.current; }

  /** Replace the visible-pixel map for all pages (pages not listed count as 0). */
  update(visible: Map<number, number>) {
    this.visible = visible;
    let best: number | null = null;
    let bestPx = 0;
    for (const [page, px] of visible) {
      if (px > bestPx || (px === bestPx && px > 0 && best !== null && page < best)) { best = page; bestPx = px; }
    }
    if (best === null || best === this.current) { this.candidate = null; this.clear(); return; }
    if (best !== this.candidate) { this.candidate = best; this.schedule(this.stableMs); }
  }

  /** Programmatic navigation (nav buttons, outline, source link, typed page). Sets the page immediately. */
  jumpTo(page: number) {
    this.current = page;
    this.candidate = null;
    this.suppressUntil = this.now() + this.suppressMs;
    this.clear();
  }

  dispose() { this.clear(); }

  private schedule(ms: number) { this.clear(); this.timer = setTimeout(() => this.confirm(), ms); }
  private clear() { if (this.timer) { clearTimeout(this.timer); this.timer = null; } }

  private confirm() {
    this.timer = null;
    const wait = this.suppressUntil - this.now();
    if (wait > 0) { this.schedule(wait); return; }
    if (this.candidate !== null && this.candidate !== this.current) {
      this.current = this.candidate;
      this.candidate = null;
      this.opts.onChange(this.current);
    }
  }
}
