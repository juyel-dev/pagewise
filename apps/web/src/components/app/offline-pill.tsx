"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
}

/** Quiet notice under the top bar while the device has no network. Studying keeps working from local data. */
export function OfflinePill() {
  const t = useTranslations("shell");
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  if (online) return null;
  return (
    <div role="status" className="mx-auto mt-3 w-fit max-w-[calc(100%-2rem)] rounded-full bg-accent-soft px-4 py-1.5 text-center text-small text-accent-text">
      {t("offline")}
    </div>
  );
}
