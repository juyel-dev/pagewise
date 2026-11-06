import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PageDetector } from "../page-detector";

const vis = (o: Record<number, number>) => new Map(Object.entries(o).map(([k, v]) => [Number(k), v]));

describe("PageDetector", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("emits only after the candidate is stable for 400 ms", () => {
    const seen: number[] = [];
    const d = new PageDetector({ onChange: (p) => seen.push(p) });
    d.update(vis({ 1: 800, 2: 0 }));
    vi.advanceTimersByTime(399);
    expect(seen).toEqual([]);
    vi.advanceTimersByTime(2);
    expect(seen).toEqual([1]);
  });

  it("does not flicker when the leader changes back before the stable time", () => {
    const seen: number[] = [];
    const d = new PageDetector({ onChange: (p) => seen.push(p) });
    d.update(vis({ 1: 800 })); vi.advanceTimersByTime(500); // current = 1
    d.update(vis({ 1: 300, 2: 500 })); vi.advanceTimersByTime(200);
    d.update(vis({ 1: 600, 2: 200 })); vi.advanceTimersByTime(1000);
    expect(seen).toEqual([1]);
  });

  it("picks the earlier page on a tie and the larger area otherwise", () => {
    const seen: number[] = [];
    const d = new PageDetector({ onChange: (p) => seen.push(p) });
    d.update(vis({ 3: 400, 4: 400 })); vi.advanceTimersByTime(500);
    expect(seen).toEqual([3]);
    d.update(vis({ 3: 100, 4: 700 })); vi.advanceTimersByTime(500);
    expect(seen).toEqual([3, 4]);
  });

  it("a programmatic jump sets the page at once and suppresses scroll detection briefly", () => {
    const seen: number[] = [];
    const d = new PageDetector({ onChange: (p) => seen.push(p) });
    d.jumpTo(5);
    expect(d.page).toBe(5);
    d.update(vis({ 4: 900, 5: 100 })); // viewport still animating past page 4
    vi.advanceTimersByTime(500);
    expect(seen).toEqual([]);
    d.update(vis({ 5: 900 })); vi.advanceTimersByTime(1000);
    expect(seen).toEqual([]);
    expect(d.page).toBe(5);
  });
});
