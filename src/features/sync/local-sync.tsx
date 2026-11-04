"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { clearLocalData, readLocalSnapshot } from "@/lib/local/store";
import { syncLocalData } from "./actions";

/**
 * Runs once per shell mount for signed-in users: uploads any guest data from this
 * browser, then clears it. Failures keep the local copy so the next load retries.
 */
export function LocalSync() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    let alive = true;

    void (async () => {
      try {
        const snapshot = await readLocalSnapshot();
        const total = snapshot.bookmarks.length + snapshot.progress.length + snapshot.attempts.length;
        if (total === 0) return;
        const result = await syncLocalData(snapshot);
        if (!result.ok) return;
        await clearLocalData();
        if (alive) router.refresh();
      } catch {
        // IndexedDB unavailable or the network failed — keep the local copy and retry later.
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  return null;
}
